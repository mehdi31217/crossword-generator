import React from 'react';
import { FantasyFlowerCoin, FantasyFlowerCoinProps } from './FantasyIcons';

export type GameCoinProps = FantasyFlowerCoinProps;

/**
 * 🪙 GameCoin — کامپوننت رفرنس و منبع واحد تمام سکه‌های بازی
 * 
 * این کامپوننت رفرنس اصلی و مرکزی آیکون سکه در کل بازی است.
 * هر تغییری در ظاهر، رنگ، انیمیشن یا SVG این کامپوننت بدهید،
 * بلافاصله در تمام بخش‌های بازی (هدر، مودال راهنما، شاپ، لابی چندنفره،
 * برج بی‌نهایت، نتایج بازی، دوئل‌ها و پنل دوستان) اعمال خواهد شد.
 * 
 * @param {number|string} [size] اندازه برحسب پیکسل یا رشته (مثال: size={16})
 * @param {string} [className] کلاس‌های CSS دلخواه (مثال: "drop-shadow")
 * @param {React.CSSProperties} [style] استایل‌های inline
 * 
 * @example
 * <GameCoin size={16} />
 * <GameCoin size={24} className="drop-shadow" />
 */
export const GameCoin: React.FC<GameCoinProps> = (props) => {
  return <FantasyFlowerCoin {...props} />;
};

export { FantasyFlowerCoin };
export default GameCoin;
