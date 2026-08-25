import { defineStore} from 'pinia'
import { getConfigAll } from '#/api/userSetting';
export const useUserSettingStore = defineStore('userSetting', {
  state: () => ({
    //
    settingConfig: {
        siteTitle: "",
        siteSubtitle: "",
        description: "",
        copyrightText: "",
        firstPopupTitle: "",
        firstPopupContent: "",
        firstPopupButtonText: "",
        firstPopupButtonUrl: "",
        noticePopup: {
            title: "",
            content: "",
            enabled: false,
            showOnce: false,
            cancelText: "",
            confirmText: "",
        },
        proxySettings: {
            sign: "",
            apiKey: "",
            enabled: false,
            ipLocation: ""
        },
        apiToken: ""
    },
  }),
  actions: {
    async getCofing(){
      const result = await getConfigAll();
      this.settingConfig = result;
    },
  },
})
