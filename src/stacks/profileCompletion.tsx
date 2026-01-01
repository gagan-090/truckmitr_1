import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { STACKS } from '@truckmitr/stacks/stacks';
import { ProfileCompletion } from '@truckmitr/layouts/index';

const Stack = createNativeStackNavigator();

export default function ProfileCompletionStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Group>
                <Stack.Screen name={STACKS.PROFILE_COMPLETION} component={ProfileCompletion} options={{ animation: 'slide_from_right' }} />
            </Stack.Group>
        </Stack.Navigator>
    )
}