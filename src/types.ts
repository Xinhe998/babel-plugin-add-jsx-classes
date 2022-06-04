export interface PluginOptions {
  className: string | Array<string>;
}

export interface PluginTransformState {
  opts: PluginOptions;
  file: any;
}
