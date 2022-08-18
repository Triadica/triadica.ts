/** a simpler type for Dispatch */
export type FnDispatch = (op: string, data: any) => void;

/** 3D point */
export type V3 = [number, number, number];

/** 2D point */
export type V2 = [number, number];

/** major type for elements */
export type TriadicaElement = TriadicaGroup | TriadicaObjectData;

export type DrawMode = "triangles" | "lines" | "line-strip" | "line-loop" | "triangle-fan" | "triangle-strip";

/** attribute can be defined in a nested form, data will be collected by Triadica into array */
export type PackedAttribute = PackedAttribute[] | Record<string, number | number[]>;

/** an object of drawing things */
export interface TriadicaObjectOptions {
  vertexShader: string;
  fragmentShader: string;
  drawMode: DrawMode;
  points?: V3[];
  indices?: number[];
  attributes?: Record<string, number[][]>;
  packedAttrs?: PackedAttribute[];
  getUniforms?: () => Record<string, any>;
  hitRegion?: TriadicaHitRegion;
}

/** object data for `object` element */
export interface TriadicaObjectData {
  type: "object";
  drawMode: DrawMode;
  vertexShader: string;
  fragmentShader: string;
  // TODO
  arrays: Record<string, any>;
  getUniforms?: () => Record<string, any>;
  hitRegion?: TriadicaHitRegion;
}

/** type for `group` element */
export interface TriadicaGroup {
  type: "group";
  children: TriadicaElement[];
}

/** hitRegion information for object element */
export interface TriadicaHitRegion {
  radius: number;
  position: V3;
  onHit?: (e: MouseEvent, d: (op: string, data: any) => void) => void;
  onMousedown?: (e: MouseEvent, d: (op: string, data: any) => void) => void;
  onMousemove?: (e: MouseEvent, d: (op: string, data: any) => void) => void;
  onMouseup?: (e: MouseEvent, d: (op: string, data: any) => void) => void;
}
