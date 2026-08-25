import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    accessMode: 'backend', // 默认为后端权限模式，可选项：backend | frontend
    watermark: true,
  },
  shortcutKeys: {
      globalSearch: false,
    },
    theme: {
      builtinType: 'sky-blue',
      colorPrimary: 'hsl(231 98% 65%)',
      mode: 'auto'
    },
    transition : {
      name: 'fade-down',
    },
    widget: {
      globalSearch : false,
      languageToggle: false,
      notification: false,
    }
});
