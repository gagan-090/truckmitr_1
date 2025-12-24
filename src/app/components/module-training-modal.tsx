import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from 'react-native';

interface TrainingCompletionModalProps {
    visible: boolean;
    onRequestClose: () => void;
    currentModule: number;
    onAttemptQuiz: () => void;
    onStartNextModule: () => void;
    totalModules: number;
}

export const TrainingCompletionModal: React.FC<TrainingCompletionModalProps> = ({
    visible,
    onRequestClose,
    currentModule,
    totalModules,
    onAttemptQuiz,
    onStartNextModule,
}) => {
    // Check if this is the last module
    const isLastModule = currentModule === totalModules;
    const { t } = useTranslation();

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onRequestClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>{t('congratulations')}</Text>

                    <Text style={styles.message}>
                        {isLastModule
                            ? `${t('youHaveCompleted')} ${totalModules} ${t('trainingModules')}`
                            : `${t('youHaveCompletedModule')} ${currentModule} ${t('trainingModule')}`
                        }
                        {'\n\n'}
                        {!isLastModule && (
                            <>
                                {t('nowYouCan')}{' '}
                                <Text style={[styles.boldText, styles.quizText]}>
                                    {t(`playTheQuizFor`)} {currentModule}
                                </Text>{' '}
                                or{' '}
                                <Text style={[styles.boldText, styles.moduleText]}>
                                    {t(`startModule`)} {currentModule + 1} {t(`module2Training`)}
                                </Text>
                                .
                            </>
                        )}
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.quizButton]}
                            onPress={() => {
                                onRequestClose();
                                onAttemptQuiz();
                            }}
                        >
                            <Text style={styles.buttonText}>
                                {t(`attemptQuiz`)} {currentModule}
                            </Text>
                        </TouchableOpacity>

                        {!isLastModule && (
                            <TouchableOpacity
                                style={[styles.button, styles.moduleButton]}
                                onPress={() => {
                                    onRequestClose();
                                    onStartNextModule();
                                }}
                            >
                                <Text style={styles.buttonText}>
                                    {t(`startModule`)} {currentModule + 1}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        width: '90%',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    } as TextStyle,
    message: {
        fontSize: 14,
        color: '#555',
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 20,
    } as TextStyle,
    boldText: {
        fontWeight: 'bold',
    } as TextStyle,
    quizText: {
        color: '#007bff',
    } as TextStyle,
    moduleText: {
        color: '#28a745',
    } as TextStyle,
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    } as ViewStyle,
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
    } as ViewStyle,
    quizButton: {
        backgroundColor: '#007bff',
    } as ViewStyle,
    moduleButton: {
        backgroundColor: '#28a745',
    } as ViewStyle,
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    } as TextStyle,
});