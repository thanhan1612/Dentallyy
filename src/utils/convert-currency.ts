const convertToMillionsThousands = (n: number): string => {
    if (n === 0) return '0';
    
    const num = Math.abs(n);
    
    if (num>= 1_000_000) {
        return `${(num / 1_000_000).toFixed(1)}M`;
    }
    
    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(1)}K`;
    }
    if (num <1000) {
        return `${num}Đ`
    }
    return n.toString();
};
export default convertToMillionsThousands;

