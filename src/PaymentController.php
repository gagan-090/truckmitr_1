<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Mail\InvoiceMail;
use App\Models\ReferralInvite;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Razorpay\Api\Api;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log as LaravelLog;

class PaymentController extends Controller

{
    /* // Web payment page
    public function paymentPage()
    {
        return view('payments.index');
    } */


    public function createOrder(Request $request)
    {
        $request->validate([
            'amount'          => 'required|numeric',
            'payment_type'    => 'required|string',
        ]);
        try {
            $key = config('services.razorpay.key') ?? env('RAZORPAY_KEY');
            $secret = config('services.razorpay.secret') ?? env('RAZORPAY_SECRET');

            if (!$key || !$secret) {
                return response()->json([
                    'status' => false,
                    'message' => 'Razorpay credentials missing',
                ], 500);
            }

            $api = new Api($key, $secret);

            $order = $api->order->create([
                'amount'          => (int) round($request->amount),
                'currency'        => $request->input('currency', 'INR'),
                'payment_capture' => 1,
                'notes'           => $request->input('notes', []),
            ]);
            //print_r($order); // For debugging
            // die();
            $user = Auth::user();
            // ✅ Save to your payments table
            Payment::create([
                'user_id'        => $user->id,
                'unique_id'      => $user->unique_id,
                'order_id'       => $order['id'],
                'amount'         => $request->amount / 100, // convert paise to INR
                'payment_type'    => $request->payment_type,
                'payment_status'  => 'pending',
                'payment_details' => json_encode($order),
            ]);

            return response()->json([
                'status' => true,
                'order' => [
                    'id' => $order['id'],
                    'amount' => $order['amount'],
                    'currency' => $order['currency'],
                    'receipt' => $order['receipt'] ?? null,
                ],
                'key' => $key,
            ]);
        } catch (\Throwable $e) {
            Log::error('Razorpay createOrder error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to create order',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
    public function getOrderPayments(Request $request)
    {
        $user = Auth::user();
        $filePath = null;

        // Step 1: Get latest local payment
        $payment = Payment::where('user_id', $user->id)->latest()->first();

        // Step 2: Sync Razorpay payment if pending
        if ($payment && $payment->payment_status === 'pending') {
            $orderId     = $payment->order_id;
            $paymentType = $payment->payment_type;

            $key = config('services.razorpay.key') ?? env('RAZORPAY_KEY');
            $secret = config('services.razorpay.secret') ?? env('RAZORPAY_SECRET');

            if ($key && $secret) {
                $url = "https://api.razorpay.com/v1/orders/{$orderId}/payments";
                $response = Http::withBasicAuth($key, $secret)->get($url);

                if ($response->successful()) {
                    $paymentsData = $response->json()['items'] ?? [];
                    foreach ($paymentsData as $paymentData) {
                        $existingPayment = Payment::where('order_id', $orderId)->latest()->first();

                        $capturedAt = null;
                        $endAt = null;

                        if ($paymentData['status'] === 'captured' && !empty($paymentData['created_at'])) {
                            $capturedAt = Carbon::createFromTimestamp($paymentData['created_at'])->timestamp;

                            if ($user->role === 'driver') {
                                $endAt = Carbon::createFromTimestamp($paymentData['created_at'])->addYear()->timestamp;
                            } elseif ($user->role === 'transporter') {
                                $endAt = Carbon::createFromTimestamp($paymentData['created_at'])->addMonths(3)->timestamp;
                            }


                            $paymentData['membership_amount'] = $paymentData['membership_amount'] ?? (($user->role === 'driver') ? 199 : 499);

                            $paymentDetails = [
                                'payment_id' => $paymentData['id'],
                                'payment_status' => $paymentData['status'],
                                'start_at' => $capturedAt,
                                'end_at' => $endAt,
                                'payment_type' => $paymentType,
                                'amount' => $paymentData['amount'] / 100,
                                'payment_details' => json_encode($paymentData),
                            ];

                            if ($existingPayment) {
                                $existingPayment->update($paymentDetails);
                                $filePath = $this->generateInvoice($existingPayment);
                            } else {
                                Payment::create(array_merge($paymentDetails, [
                                    'order_id' => $orderId,
                                    'user_id' => $payment->user_id,
                                    'unique_id' => $payment->unique_id,
                                    'payment_status' => 'pending',
                                ]));
                            }
                        }
                    }
                } else {
                    Log::error('Razorpay API Error', ['response' => $response->body()]);
                }
            }
        }

        // Step 3: Handle referral-based manual payment
        $acceptedCount = ReferralInvite::where('user_id', $user->id)
            ->where('status', 'accepted')
            ->count();

        $capturedPayment = Payment::where('user_id', $user->id)
            ->where('payment_status', 'captured')
            ->orderBy('created_at', 'desc')
            ->first();

        if ($acceptedCount >= 5 && $user->role === 'driver' && !$capturedPayment) {
            $orderId   = 'order_referral_invites';
            $paymentId = 'pay_referral_invites';
            $startAt = Carbon::now()->timestamp;
            $endAt = Carbon::now()->addYear()->timestamp;

            $data = [
                "id" => $paymentId,
                "order_id" => $orderId,
                "status" => "captured",
                "created_at" => $startAt,
                "end_at" => $endAt,
                "amount" => 19900,
                "membership_amount" => 199,
                "notes" => [
                    "role" => $user->role,
                    "unique_id" => $user->unique_id
                ],
                "email" => $user->email,
                "contact" => $user->mobile,
            ];

            $payment = Payment::create([
                'user_id' => $user->id,
                'unique_id' => $user->unique_id,
                'order_id' => $orderId,
                'start_at' => $startAt,
                'end_at' => $endAt,
                'amount' => 199.00,
                'payment_id' => $paymentId,
                'payment_status' => 'captured',
                'payment_type' => 'subscription',
                'payment_details' => json_encode($data, JSON_UNESCAPED_SLASHES),
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Payment sync completed',
            'filePath' => $filePath ?? null,
            'referral_count' => $acceptedCount,
            'email_required' => empty($user->email)
        ]);
    }

    public function verifyPayment(Request $request)
    {
        $request->validate([
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
        ]);

        try {
            $api = new Api(
                config('services.razorpay.key'),
                config('services.razorpay.secret')
            );

            $attributes = [
                'razorpay_order_id'   => $request->razorpay_order_id,
                'razorpay_payment_id' => $request->razorpay_payment_id,
                'razorpay_signature'  => $request->razorpay_signature,
            ];

            $api->utility->verifyPaymentSignature($attributes);

            $payment = Payment::where('order_id', $request->razorpay_order_id)->first();
            if ($payment) {
                $payment->update([
                    'payment_id' => $request->razorpay_payment_id,
                    'payment_status' => 'captured',
                ]);
            }

            return response()->json(['status' => true, 'message' => 'Payment verified']);
        } catch (\Throwable $e) {
            Log::error('Razorpay verifyPayment error: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Verification failed'], 400);
        }
    }

    public function capture(Request $request)
    {
        $request->validate([
            'unique_id'       => 'required',
            'order_id'        => 'required',
            // Optional fields from Razorpay frontend to re-verify
            'payment_id'      => 'required',
            'signature'       => 'sometimes|string',
            'start_at'        => 'required|numeric',
            'end_at'          => 'required|numeric',
            'amount'          => 'required|numeric',
            'payment_status'  => 'required',
            'payment_type'    => 'required|string',
            'payment_details' => 'nullable|string',
        ]);

        $user = Auth::user();

        // Optionally re-verify signature if provided
        if ($request->filled('signature')) {
            try {
                $key = config('services.razorpay.key') ?? env('RAZORPAY_KEY');
                $secret = config('services.razorpay.secret') ?? env('RAZORPAY_SECRET');
                $api = new Api($key, $secret);
                $api->utility->verifyPaymentSignature([
                    'razorpay_order_id' => $request->order_id,
                    'razorpay_payment_id' => $request->payment_id,
                    'razorpay_signature' => $request->signature,
                ]);
            } catch (\Throwable $e) {
                return response()->json([
                    'status' => false,
                    'message' => 'Signature verification failed',
                    'error' => config('app.debug') ? $e->getMessage() : null,
                ], 422);
            }
        }

    

        $payment = Payment::where('user_id', $user->id)
            ->where('unique_id', $request->unique_id)
            ->where('order_id', $request->order_id)
            ->latest('id')
            ->first();

        if ($payment) {
            // Update existing record
            $payment->update([
                'start_at'       => $request->start_at,
                'end_at'         => $request->end_at,
                'amount'         => $request->amount / 100,
                'payment_id'     => $request->payment_id,
                'payment_status' => "captured",
                'payment_type'   => $request->payment_type,
                'payment_details' => $request->payment_details,
            ]);
        } else {
            // Optionally, create a new record if not exists
            $payment = Payment::create([
                'user_id'        => $user->id,
                'unique_id'      => $request->unique_id,
                'order_id'       => $request->order_id,
                'start_at'       => $request->start_at,
                'end_at'         => $request->end_at,
                'amount'         => $request->amount / 100,
                'payment_id'     => $request->payment_id,
                'payment_status' => $request->payment_status,
                'payment_type'   => $request->payment_type,
                'payment_details' => $request->payment_details,
            ]);
        }

        $filePath = $this->generateInvoice($payment);


        if ($user->email) {
            $emailRequired = false;
        } else {
            $emailRequired = true; // front end should ask for email
        }


        return response()->json([
            'status'  => true,
            'message' => 'Payment captured, invoice saved & sent on WhatsApp',
            'data'    => [
                'payment'           => $payment,
                'invoice_url'       => $filePath,
                'email_required'    => $emailRequired
            ]
        ], 201);
    }

    // Generate Invoice (PDF)
    public function generateInvoice($payment)
    {
        $user = Auth::user();
        
        // Use the passed payment directly if it's already captured, otherwise query
        if ($payment->payment_status !== 'captured') {
            $payment = Payment::where('user_id', $payment->user_id)
                ->where('payment_status', 'captured')
                ->orderBy('created_at', 'desc')
                ->first();
        }
        
        if (!$payment) {
            Log::error('generateInvoice: No captured payment found for user_id: ' . ($user->id ?? 'unknown'));
            return null;
        }

        $user = User::select('users.*', 'states.name as state_name')
            ->leftJoin('states', 'users.states', '=', 'states.id')
            ->where('users.id', $payment->user_id)
            ->first();
        
        if (!$user) {
            Log::error('generateInvoice: User not found for payment_id: ' . $payment->id);
            return null;
        }
        $originalamt = 0;
        $quantity = 0;
        //echo $payment->payment_type; die();
        if ($payment->payment_type == 'subscription') {
            $type = 'Subscription';
            $originalamt = $user->role === 'driver' ? 199 : 499;
        } elseif ($payment->payment_type == 'transporter_verification') {
            $type = 'Verification';
            $originalamt = $payment->amount;
        } elseif ($payment->payment_type == 'verification') {
            $type = 'Verification';
            $originalamt = $payment->amount;
        }
        //$quantity = optional(json_decode($payment->payment_details))->notes->driver_count ?? null;
        // --- Quantity calculation ---
        $quantity = optional(json_decode($payment->payment_details))->notes->driver_count ?? null;
        // --- Quantity calculation ---
        if (in_array($payment->payment_type, ['transporter_verification', 'verification'])) {
            // Each verification costs ₹1180 (GST inclusive)
            // $quantity = (int) ($payment->amount / 1180);
            $quantity = optional(json_decode($payment->payment_details))->notes->driver_count ?? null;
        } else {
            $quantity = 1;
        }

        // --- GST calculation (18% GST included in ₹1180) ---
        $baseAmount = round($originalamt / 1.18, 2);        // Base amount per unit (excl. GST)
        $gstAmount  = round($originalamt - $baseAmount, 2); // GST per unit

        // --- Optional debug log ---
        Log::info("Invoice GST Calc => Base: {$baseAmount}, GST: {$gstAmount}, Qty: {$quantity}");

        // --- Invoice data ---
        $invoiceData = [
            'invoice_no'     => 'TM-' . strtoupper($user->role ?? 'DRV') . '-' . now()->format('Y') . '-' . str_pad($payment->id, 5, '0', STR_PAD_LEFT),
            'invoice_date'   => now()->format('d M Y'),
            'user'           => $user,
            'user_name'      => ucwords($user->name_eng),
            'state'          => $user->state_name,
            'amount'         => number_format($payment->amount, 2),
            'originalamt'    => $originalamt,
            'transaction_id' => $payment->payment_id,
            'order_id'       => $payment->order_id,
            'user_role'      => ucwords($user->role),
            'payment_type'   => $type,
            'quantity'       => $quantity,
            'baseAmount'     => number_format($baseAmount, 2),
            'gstAmount'      => number_format($gstAmount, 2),
            'payment_status' => $payment->payment_status,
        ];
        //print_r($invoiceData); die();
        try {
            if ($payment->payment_type == 'transporter_verification' || $payment->payment_type == 'verification') {
                $pdf = Pdf::loadView('emails.invoice_verification', $invoiceData);
            } else {
                $pdf = Pdf::loadView('emails.invoice', $invoiceData);
            }
            
            $filename = "Invoice_{$invoiceData['invoice_no']}.pdf";
            
            // Ensure invoices directory exists with proper permissions
            $invoiceDir = public_path('invoices');
            if (!is_dir($invoiceDir)) {
                if (!mkdir($invoiceDir, 0777, true)) {
                    Log::error('Failed to create invoices directory: ' . $invoiceDir);
                    // Try alternative path
                    $invoiceDir = storage_path('app/public/invoices');
                    if (!is_dir($invoiceDir)) {
                        mkdir($invoiceDir, 0777, true);
                    }
                }
            }
            
            // Ensure directory is writable
            if (!is_writable($invoiceDir)) {
                chmod($invoiceDir, 0777);
            }
            
            $filePath = $invoiceDir . '/' . $filename;
            
            if (file_put_contents($filePath, $pdf->output()) === false) {
                Log::error('Failed to write invoice file: ' . $filePath);
                throw new \Exception('Failed to write invoice file');
            }
            
            Log::info('Invoice PDF generated successfully: ' . $filePath);
    
            // Send Invoice via WhatsApp
            $response = null;
            try {
                $response = $this->sendInvoicewhatsApp($filename, $payment->payment_type);
                Log::info('WhatsApp invoice sent for: ' . $filename);
            } catch (\Exception $e) {
                Log::error('Failed to send WhatsApp invoice: ' . $e->getMessage());
            }

            // Send Email
            if (!empty($user->email)) {
                try {
                    Mail::to($user->email)->send(new InvoiceMail($invoiceData));
                    Log::info('Invoice mail sent successfully to: ' . $user->email);
                } catch (\Exception $e) {
                    Log::error('Failed to send invoice mail to: ' . $user->email . '. Error: ' . $e->getMessage());
                }
            } else {
                Log::info('No email address for user, skipping email invoice');
            }

            return [
                'filePath' => $filePath,
                'response' => $response,
            ];
        } catch (\Exception $e) {
            Log::error('generateInvoice failed: ' . $e->getMessage());
            return null;
        }
    }

    public function sendInvoicewhatsApp($filename, $paymenttype)
    {
        $user = Auth::user();
        $to = '91' . $user->mobile;
        $userrole = strtolower($user->role);
        $whatsappService = new WhatsAppService();
        $whatsappFileUrl = rtrim(env('APP_URL'), '/') . "/public/invoices/{$filename}";

        if ($paymenttype == 'transporter_verification' || $paymenttype == 'verification') {
            $lang_code = "en_US";
            $templateName = "truckmitr_send_verificationpayment_invoice_01";
        } else if ($paymenttype == 'subscription') {
            $lang_code = "en";
            $templateName = "truckmitr_send_payment_invoice_01";
        }

        /* $templateName = $userrole === 'driver'
            ? "truckmitr_send_invoice"
            : "truckmitr_send_verification_invoice"; */


        $response = $whatsappService->sendTemplate(
            $to,
            $templateName,
            $lang_code,
            [$user->name_eng, $filename],
            [
                [
                    "type"      => "document",
                    "filename"  => $filename,
                    "url"       => $whatsappFileUrl
                ]
            ]
        );

        Log::info("WhatsApp Response: ", $response);
        return $response;
    }

    // Send Invoice Email if not sent earlier
    public function sendInvoiceEmail(Request $request)
    {
        $request->validate([
            'email'         => 'required|email'
        ]);

        $user = Auth::user();

        $payment = Payment::where('user_id', $user->id)
            ->where('payment_status', 'captured')
            ->orderBy('created_at', 'desc')
            ->first();

        // print_r($payment); die();

        $user = User::findOrFail($payment->user_id);

        // Update user's email
        $user->update(['email' => $request->email]);

        $user = User::select('users.*', 'states.name as state_name')
            ->leftJoin('states', 'users.states', '=', 'states.id')
            ->where('users.id', $payment->user_id)
            ->first();
        $originalamt = 0;
        $quantity = 0;
        //echo $payment->payment_type; die();
        if ($payment->payment_type == 'subscription') {
            $type = 'Subscription';
            $originalamt = $user->role === 'driver' ? 199 : 499;
        } elseif ($payment->payment_type == 'transporter_verification') {
            $type = 'Verification';
            $originalamt = $payment->amount;
        } elseif ($payment->payment_type == 'verification') {
            $type = 'Verification';
            $originalamt = $payment->amount;
        }

        // Quantity calculation
        if ($payment->payment_type == 'transporter_verification') {
            $quantity = (int) ($payment->amount / 700);
        } elseif ($payment->payment_type == 'verification') {
            $quantity = (int) ($payment->amount / 1180);
        }

        $invoiceData = [
            'invoice_no'     => 'TM-' . strtoupper($user->role ?? 'DRV') . '-' . now()->format('Y') . '-' . str_pad($payment->id, 5, '0', STR_PAD_LEFT),
            'invoice_date'   => now()->format('d M Y'),
            'user'           => $user,
            'user_name'      => ucwords($user->name_eng),
            'state'          => $user->state_name,
            'amount'         => number_format($payment->amount, 2),
            'originalamt'    => $originalamt,
            'transaction_id' => $payment->payment_id,
            'order_id'       => $payment->order_id,
            'user_role'      => ucwords($user->role),
            'payment_type'   => $type,
            'quantity'       => $quantity,
            'payment_status' => $payment->payment_status,
        ];

        //print_r($invoiceData); die();
        if ($payment->payment_type == 'transporter_verification' || $payment->payment_type == 'verification') {
            $pdf = Pdf::loadView('emails.invoice_verification', $invoiceData);
        } else {
            $pdf = Pdf::loadView('emails.invoice', $invoiceData);
        }

        // Send Email
        if (!empty($user->email)) {
            try {
                Mail::to($user->email)->send(new InvoiceMail($invoiceData));

                // If no exception, log success
                Log::info('Invoice mail sent successfully to: ' . $user->email);
            } catch (\Exception $e) {
                // Log the failure
                Log::error('Failed to send invoice mail to: ' . $user->email . '. Error: ' . $e->getMessage());
            }
        }
        /* Mail::to($user->email)
            ->bcc('sandeep@pizoneinfotech.com')
            ->send(new InvoiceMail($invoiceData)); */

        return response()->json([
            'status'  => true,
            'message' => 'Invoice email sent successfully',
            'data'    => $invoiceData
        ], 200);
    }


    // Get Payment Details
    public function details()
    {
        $user = Auth::user();
        $payments = Payment::where('user_id', $user->id)->where('payment_status', 'captured')->latest()->get();

        return response()->json([
            'status' => true,
            'data'   => $payments,
        ]);
    }


    // Delete Payment
    public function delete($id)
    {
        $user = Auth::user();

        $payment = Payment::where('id', $id)->where('user_id', $user->id)->first();

        if (!$payment) {
            return response()->json([
                'status'  => false,
                'message' => 'Payment not found or unauthorized.',
            ], 404);
        }

        $payment->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Payment deleted successfully.',
        ]);
    }


    // Admin Payment Lookup Page
    public function adminPaymentLookup()
    {
        if (Session::get('role') != 'admin') {
            return redirect('admin');
        }
        return view('Admin.payment-lookup');
    }

    // Admin Payment Lookup Process
    public function adminPaymentLookupProcess(Request $request)
    {
        if (Session::get('role') != 'admin') {
            return redirect('admin');
        }

        $request->validate([
            'user_id' => 'required|exists:users,unique_id',
            'order_id' => 'required|string',
            'start_at' => 'nullable',
        ]);

        try {
            $orderId = $request->order_id;
            $paymentType = $request->payment_type ?? 'subscription';

            // Get user
            $user = User::where('unique_id', $request->user_id)->firstOrFail();

            //print_r($user); // For debugging
            // Razorpay creds
            $key    = config('services.razorpay.key') ?? env('RAZORPAY_KEY');
            $secret = config('services.razorpay.secret') ?? env('RAZORPAY_SECRET');

            if (!$key || !$secret) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Razorpay credentials missing',
                ], 500);
            }

            // Fetch order payments
            $url = "https://api.razorpay.com/v1/orders/{$orderId}/payments";
            $response = Http::withBasicAuth($key, $secret)->get($url);

            if (!$response->successful()) {
                Log::error('Razorpay API Error', ['response' => $response->body()]);
                return response()->json([
                    'status'  => false,
                    'message' => 'Failed to fetch payments from Razorpay',
                    'error'   => $response->body(),
                ], $response->status());
            }

            $paymentsData = $response->json()['items'] ?? [];
            if (empty($paymentsData)) {
                return response()->json([
                    'status'  => false,
                    'message' => 'No payments found for this order.'
                ]);
            }
            //dd($paymentsData); die();
            $filePath = null;
            foreach ($paymentsData as $paymentData) {

                // Calculate start/end dates
                $capturedAt = null;
                $endAt = null;

                if ($paymentData['status'] === 'captured' && !empty($paymentData['created_at'])) {
                    $capturedAt = Carbon::createFromTimestamp($paymentData['created_at'])->timestamp;

                    if ($user->role === 'driver') {
                        $endAt = Carbon::createFromTimestamp($paymentData['created_at'])
                            ->addYear()->timestamp;
                    } elseif ($user->role === 'transporter') {
                        $endAt = Carbon::createFromTimestamp($paymentData['created_at'])
                            ->addMonths(3)->timestamp;
                    }
                }

                // Add membership amount if missing
                $paymentData['membership_amount'] = $paymentData['membership_amount'] ??
                    (($user->role === 'driver') ? 199 : 499);

                // Data to save
                $paymentDetails = [
                    'payment_id'      => $paymentData['id'],
                    'payment_status'  => $paymentData['status'], // captured, failed, etc.
                    'start_at'        => $capturedAt,
                    'end_at'          => $endAt,
                    'payment_type'    => $paymentType,
                    'amount'          => $paymentData['amount'] / 100, // INR
                    'payment_details' => json_encode($paymentData),
                ];

                // Check if already exists
                $existingPayment = Payment::where('order_id', $orderId)->latest()->first();

                if ($existingPayment) {
                    $existingPayment->update($paymentDetails);
                } else {
                    Payment::create(array_merge($paymentDetails, [
                        'order_id'  => $orderId,
                        'user_id'   => $user->id,
                        'unique_id' => $user->unique_id,
                    ]));
                }
            }

            return view('Admin.payment-lookup-results', [
                'payments' => $paymentsData,
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            Log::error('Payment Sync Error: ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Unexpected error: ' . $e->getMessage()
            ], 500);
        }
    }
}
