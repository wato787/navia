/**
 * Mapbox関連のユーティリティ関数
 */

/**
 * GeoJSONの座標からバウンディングボックスを計算
 * 地図の表示範囲を決定するために使用
 */
export function calculateBounds(
  coordinates: GeoJSON.Position[],
): [[number, number], [number, number]] {
  return coordinates.reduce(
    (bounds, coord) => {
      return [
        [Math.min(bounds[0][0], coord[0]), Math.min(bounds[0][1], coord[1])],
        [Math.max(bounds[1][0], coord[0]), Math.max(bounds[1][1], coord[1])],
      ];
    },
    [
      [Infinity, Infinity],
      [-Infinity, -Infinity],
    ] as [[number, number], [number, number]],
  );
}
