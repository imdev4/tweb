/*
 * https://github.com/morethanwords/tweb
 * Copyright (C) 2019-2021 Eduard Kuzmenko
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import pagesManager from './pagesManager';

export default class Page {
  public pageEl: HTMLDivElement;
  private installed = false;

  constructor(
    private className: string,
    public isAuthPage: boolean,
    private onFirstMount?: (...args: any[]) => Promise<any> | void,
    private onMount?: (...args: any[]) => Promise<any> | void,
    public onShown?: () => void
  ) {
    this.pageEl = document.body.querySelector('.' + this.className) as HTMLDivElement;
  }

  public remount() {
    this.pageEl = document.body.querySelector('.' + this.className) as HTMLDivElement;
    this.installed = false;
  }

  public async mount(...args: any[]) {
    // this.pageEl.style.display = '';

    if(this.onMount) {
      const res = this.onMount(...args);
      if(res instanceof Promise) {
        await res;
      }
    }

    if(!this.installed) {
      if(this.onFirstMount) {
        try {
          const res = this.onFirstMount(...args);
          if(res instanceof Promise) {
            await res;
          }
        } catch(err) {
          console.error('PAGE MOUNT ERROR:', err);
        }
      }

      this.installed = true;
    }

    pagesManager.setPage(this);
  }
}
