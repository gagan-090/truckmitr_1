type HitSlopSize = 10 | 15 | 20 | 25 | 30

export const hitSlop = (size: HitSlopSize = 10) => {
    const options = {
        10: { top: 10, bottom: 10, left: 10, right: 10 },
        15: { top: 15, bottom: 15, left: 15, right: 15 },
        20: { top: 20, bottom: 20, left: 20, right: 20 },
        25: { top: 25, bottom: 25, left: 25, right: 25 },
        30: { top: 30, bottom: 30, left: 30, right: 30 }
    };

    return options[size] || options[10];
};
