declare namespace VueThree {
  /**
   * 舞台模型
   * 统一管理 Scene Camera Light 等资源
   */
  export interface IStage {}

  export interface ICameraConfig{
    fov: number
    aspect:number
    near:number
    far:number
    viewX: number
    viewY: number
    viewZ:number
    rotationY:number
  }
}
