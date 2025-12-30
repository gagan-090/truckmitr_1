import Sound from 'react-native-sound';

Sound.setCategory('Playback');

let currentSound: Sound | null = null;

export const playVoiceOnce = (fileName: string) => {
    // Stop previous sound if any
    if (currentSound) {
        currentSound.stop();
        currentSound.release();
        currentSound = null;
    }

    currentSound = new Sound(fileName, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            console.log('❌ Audio load error:', error);
            return;
        }

        currentSound?.play((success) => {
            if (!success) {
                console.log('❌ Audio playback failed');
            }
            currentSound?.release();
            currentSound = null;
        });
    });
};

export const stopVoice = () => {
    if (currentSound) {
        currentSound.stop();
        currentSound.release();
        currentSound = null;
    }
};
