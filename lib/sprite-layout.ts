/**
 * 9宫格布局：三排互相叠放
 * - 前3个(0,1,2)：最底排，向上偏移1/2距离压在中间排上面
 * - 中3个(3,4,5)：中间排
 * - 后3个(6,7,8)：顶上排，向下偏移1/2距离放在中间排后面
 * - 第1、4、7个(0,3,6)：向右偏移1/2距离
 * - 第3、6、9个(2,5,8)：向左偏移1/2距离
 */
const COL_OFFSET = 16.67; // 1/2 of ~33.33% column spacing

export function getSpriteGridPosition(
  index: number,
  spriteHeight: number,
): { x: number; y: number; offsetY: number } {
  const col = index % 3;
  const row = Math.floor(index / 3);
  const xMap = [16.67, 50, 83.33];
  const yMap = [83, 50, 25];
  const offsetY =
    row === 0 ? -spriteHeight / 2 : row === 2 ? spriteHeight / 2 : 0;
  const offsetX = col === 0 ? COL_OFFSET : col === 2 ? -COL_OFFSET : 0;
  return {
    x: (xMap[col] ?? 50) + offsetX,
    y: yMap[row] ?? 50,
    offsetY,
  };
}
