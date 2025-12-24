import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    ScrollView,
} from 'react-native'
import React from 'react'
import { useColor, useResponsiveScale } from '../hooks'
import { useTranslation } from 'react-i18next'
import RenderHtml from 'react-native-render-html'
import { BASE_URL } from '@truckmitr/src/utils/config'

type WelcomeModalProps = {
    visible: boolean
    onClose: () => void
    title?: string
    welcomeMessage?: string
    image?: any
}

type ContentItem = {
    type: 'text' | 'image';
    content: string;
};

export default function WelcomeModal({
    visible,
    onClose,
    title,
    welcomeMessage,
    image,
}: WelcomeModalProps) {
    const { t } = useTranslation()
    const colors = useColor()
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale()

    // Function to parse HTML and maintain the sequence of text and images
    const parseHtmlContent = (html: string): ContentItem[] => {
        if (!html) return [];
        const items: ContentItem[] = [];
        let tempHtml = html;

        const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/g;
        let match;
        let lastIndex = 0;
        while ((match = imgRegex.exec(tempHtml)) !== null) {
            const textBefore = tempHtml.substring(lastIndex, match.index);
            if (textBefore.trim()) {
                items.push({
                    type: 'text',
                    content: textBefore.trim()
                });
            }
            items.push({
                type: 'image',
                content: match[1]
            });

            lastIndex = imgRegex.lastIndex;
        }
        const remainingText = tempHtml.substring(lastIndex);
        if (remainingText.trim()) {
            items.push({
                type: 'text',
                content: remainingText.trim()
            });
        }
        if (items.length === 0 && html.trim()) {
            items.push({
                type: 'text',
                content: html.trim()
            });
        }

        return items;
    };

    const contentItems = welcomeMessage ? parseHtmlContent(welcomeMessage) : [];

    // Custom styles for HTML rendering (for text content only)
    const tagsStyles = {
        body: {
            fontSize: responsiveFontSize(1.9),
            color: colors.blackOpacity(0.7),
            lineHeight: responsiveHeight(3),
            textAlign: 'center' as const,
        },
        p: {
            fontSize: responsiveFontSize(1.9),
            color: colors.blackOpacity(0.7),
            lineHeight: responsiveHeight(3),
            textAlign: 'center' as const,
        },
        strong: {
            fontWeight: 'bold' as const,
            color: colors.blackOpacity(0.9),
        },
        b: {
            fontWeight: 'bold' as const,
            color: colors.blackOpacity(0.9),
        },
        i: {
            fontStyle: 'italic' as const,
        },
        u: {
            textDecorationLine: 'underline' as const,
        },
        h1: {
            fontSize: responsiveFontSize(3),
            fontWeight: 'bold' as const,
            color: colors.black,
            marginVertical: responsiveHeight(1),
            textAlign: 'center' as const,
        },
        h2: {
            fontSize: responsiveFontSize(2.5),
            fontWeight: 'bold' as const,
            color: colors.black,
            marginVertical: responsiveHeight(0.8),
            textAlign: 'center' as const,
        },
        h3: {
            fontSize: responsiveFontSize(2.2),
            fontWeight: 'bold' as const,
            color: colors.black,
            marginVertical: responsiveHeight(0.6),
            textAlign: 'center' as const,
        },
    };

    const renderersProps = {
        img: {
            enableExperimentalPercentWidth: true,
        },
    };

    // Function to render individual content items
    const renderContentItem = (item: ContentItem, index: number) => {
        if (item.type === 'image') {
            return (
                <View key={index} style={[
                    styles.imageWrapper,
                    {
                        marginVertical: responsiveHeight(1),
                    }
                ]}>
                    <Image
                        source={{
                            uri: item.content.startsWith('http')
                                ? item.content
                                : `${BASE_URL}${item.content}`
                        }}
                        style={{
                            width: '100%',
                            maxHeight: responsiveHeight(100),
                            aspectRatio: .85,
                            borderRadius: responsiveWidth(2),
                            resizeMode: 'contain',
                            alignSelf: 'center',
                        }}
                    />
                </View>
            );
        } else {
            return (
                <View key={index} style={[
                    styles.htmlContainer,
                    {
                        marginHorizontal: responsiveWidth(5),
                        marginVertical: responsiveHeight(0.5),
                    }
                ]}>
                    <RenderHtml
                        contentWidth={responsiveWidth(75)}
                        source={{ html: item.content }}
                        tagsStyles={tagsStyles}
                        renderersProps={renderersProps}
                        baseStyle={{
                            textAlign: 'center',
                        }}
                    />
                </View>
            );
        }
    };

    return (
        <Modal
            animationType={'fade'}
            transparent={true}
            visible={visible}
            statusBarTranslucent
            onRequestClose={onClose}>

            <View style={[
                styles.container,
                { backgroundColor: colors.blackOpacity(0.6) }
            ]}>
                <View style={[
                    styles.modalCard,
                    {
                        backgroundColor: colors.white,
                        borderRadius: responsiveWidth(4),
                        marginHorizontal: responsiveWidth(5),
                    },
                ]}
                >
                    {/* Close Icon Top Right */}
                    <TouchableOpacity
                        style={styles.closeIcon}
                        onPress={onClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={{ fontSize: responsiveFontSize(3), color: colors.black }}>✕</Text>
                    </TouchableOpacity>
                    {/* Centered Content */}
                    <View style={styles.centerWrapper}>
                        {/* Scrollable content */}
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{
                                flexGrow: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: responsiveHeight(1)
                            }}
                        >
                            {/* Show default image only if no content items exist */}
                            {contentItems.length === 0 ? (
                                <View style={styles.iconContainer}>
                                    <View style={[
                                        styles.iconCircle,
                                        {
                                            backgroundColor: '#E8F5E9',
                                            width: responsiveWidth(25),
                                            height: responsiveWidth(25),
                                            borderRadius: responsiveWidth(15)
                                        }
                                    ]}>
                                        {image ? (
                                            <Image
                                                source={image}
                                                style={{
                                                    width: responsiveWidth(20),
                                                    height: responsiveWidth(20),
                                                    resizeMode: 'contain'
                                                }}
                                            />
                                        ) : (

                                            <Text style={[
                                                styles.iconText,
                                                { fontSize: responsiveFontSize(4), color: '#4CAF50' }
                                            ]}>
                                                🎉
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            ) : (
                                // Render content items in sequence
                                <View style={styles.contentContainer}>
                                    {contentItems.map((item, index) =>
                                        renderContentItem(item, index)
                                    )}
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </View >
        </Modal >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 20,
        zIndex: 10,
    },
    modalCard: {
        width: '95%',
        maxWidth: 450,
        height: '85%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    centerWrapper: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        width: '100%',
        alignItems: 'center',
    },
    htmlContainer: {
        width: '100%',
        alignItems: 'center',
    },
    imageWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    iconContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    iconCircle: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 40,
    },
    title: {
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 32,
    },
    closeButton: {
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontWeight: '600',
    },
})