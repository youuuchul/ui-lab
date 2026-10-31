declare module "d3-force-3d" {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  type Force = any
  export function forceSimulation(nodes?: any[], numDimensions?: number): any
  export function forceLink(links?: any[]): Force
  export function forceManyBody(): Force
  export function forceCollide(radius?: number | ((n: any) => number)): Force
  export function forceCenter(x?: number, y?: number, z?: number): Force
  export function forceRadial(radius: number, x?: number, y?: number, z?: number): Force
  export function forceX(x?: number): Force
  export function forceY(y?: number): Force
  export function forceZ(z?: number): Force
}
