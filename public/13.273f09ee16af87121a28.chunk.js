(this.webpackJsonp=this.webpackJsonp||[]).push([[13,15,17,21,30],{110:function(e,t,n){"use strict";n.d(t,"a",(function(){return a}));var i=n(52);class a{constructor(e,t){this.inputField=e,this.size=t,this.max=45,this.needFrame=0,this.container=document.createElement("div"),this.container.classList.add("media-sticker-wrapper");const n=e.input;n.addEventListener("blur",()=>{this.playAnimation(0)}),n.addEventListener("input",t=>{this.playAnimation(e.value.length)})}playAnimation(e){if(!this.animation)return;let t;(e=Math.min(e,30))?(t=Math.round(Math.min(this.max,e)*(165/this.max)+11.33),this.idleAnimation&&(this.idleAnimation.stop(!0),this.idleAnimation.canvas.style.display="none"),this.animation.canvas.style.display=""):t=0;const n=this.needFrame>t?-1:1;this.animation.setDirection(n),0!==this.needFrame&&0===t&&this.animation.setSpeed(7),this.needFrame=t,this.animation.play()}load(){return this.loadPromise?this.loadPromise:this.loadPromise=Promise.all([i.b.loadAnimationFromURL({container:this.container,loop:!0,autoplay:!0,width:this.size,height:this.size},"assets/img/TwoFactorSetupMonkeyIdle.tgs").then(e=>(this.idleAnimation=e,this.inputField.value.length||e.play(),i.b.waitForFirstFrame(e))),i.b.loadAnimationFromURL({container:this.container,loop:!1,autoplay:!1,width:this.size,height:this.size},"assets/img/TwoFactorSetupMonkeyTracking.tgs").then(e=>(this.animation=e,this.inputField.value.length||(this.animation.canvas.style.display="none"),this.animation.addEventListener("enterFrame",e=>{(1===this.animation.direction&&e>=this.needFrame||-1===this.animation.direction&&e<=this.needFrame)&&(this.animation.setSpeed(1),this.animation.pause()),0===e&&0===this.needFrame&&this.idleAnimation&&(this.idleAnimation.canvas.style.display="",this.idleAnimation.play(),this.animation.canvas.style.display="none")}),i.b.waitForFirstFrame(e)))])}remove(){this.animation&&this.animation.remove(),this.idleAnimation&&this.idleAnimation.remove()}}},111:function(e,t,n){"use strict";n.d(t,"a",(function(){return a}));var i=n(38);class a extends i.b{constructor(e){super(Object.assign({plainText:!0},e));const t=this.input;t.type="tel",t.setAttribute("required",""),t.autocomplete="off";let n=0;this.input.addEventListener("input",t=>{this.input.classList.remove("error"),this.setLabel();const i=this.value.replace(/\D/g,"").slice(0,e.length);this.setValueSilently(i);const a=this.value.length;if(a===e.length)e.onFill(this.value);else if(a===n)return;n=a})}}},18:function(e,t,n){"use strict";n.r(t),n.d(t,"ripple",(function(){return c}));var i=n(6),a=n(59),s=n(1),o=n(15);let r=0;function c(e,t=(()=>Promise.resolve()),n=null,c=!1){if(e.querySelector(".c-ripple"))return;e.classList.add("rp");let l=document.createElement("div");l.classList.add("c-ripple");let d;e.classList.contains("rp-square")&&l.classList.add("is-square"),e[c?"prepend":"append"](l);const u=(e,i)=>{const o=Date.now(),c=document.createElement("div"),u=r++,h=1e3*+window.getComputedStyle(l).getPropertyValue("--ripple-duration").replace("s","");d=()=>{let e=Date.now()-o;const t=()=>{a.a.mutate(()=>{c.remove()}),n&&n(u)};if(e<h){let n=Math.max(h-e,h/2);setTimeout(()=>c.classList.add("hiding"),Math.max(n-h/2,0)),setTimeout(t,n)}else c.classList.add("hiding"),setTimeout(t,h/2);s.IS_TOUCH_SUPPORTED||window.removeEventListener("contextmenu",d),d=null,p=!1},t&&t(u),window.requestAnimationFrame(()=>{const t=l.getBoundingClientRect();c.classList.add("c-ripple__circle");const n=e-t.left,a=i-t.top,s=Math.sqrt(Math.pow(Math.abs(a-t.height/2)+t.height/2,2)+Math.pow(Math.abs(n-t.width/2)+t.width/2,2)),o=n-s/2,r=a-s/2;c.style.width=c.style.height=s+"px",c.style.left=o+"px",c.style.top=r+"px",l.append(c)})},h=t=>t.target!==e&&(["BUTTON","A"].includes(t.target.tagName)||Object(i.a)(t.target,"c-ripple")!==l);let p=!1;if(s.IS_TOUCH_SUPPORTED){let t=()=>{d&&d()};e.addEventListener("touchstart",n=>{if(!o.default.settings.animationsEnabled)return;if(n.touches.length>1||p||h(n))return;p=!0;let{clientX:i,clientY:a}=n.touches[0];u(i,a),e.addEventListener("touchend",t,{once:!0}),window.addEventListener("touchmove",n=>{n.cancelBubble=!0,n.stopPropagation(),t(),e.removeEventListener("touchend",t)},{once:!0})},{passive:!0})}else e.addEventListener("mousedown",t=>{if(![0,2].includes(t.button))return;if(!o.default.settings.animationsEnabled)return;if("0"===e.dataset.ripple||h(t))return;if(p)return void(p=!1);let{clientX:n,clientY:i}=t;u(n,i),window.addEventListener("mouseup",d,{once:!0,passive:!0}),window.addEventListener("contextmenu",d,{once:!0,passive:!0})},{passive:!0})}},20:function(e,t,n){"use strict";n.r(t);var i=n(35),a=n(50),s=n(17),o=n(32),r=n(31),c=n(62),l=n(38),d=n(56),u=n(33),h=n(88),p=n(1),m=n(8),g=n(16),f=n(52),v=n(18),b=n(64),y=n(6),E=n(67),w=n(99),L=n(116),_=n(22),O=n(93),S=n(5),T=n(30),j=n(36),k=n(60),P=n(66),x=n(101),C=n(92),A=n(53),I=n(81),D=n(15),R=n(122),F=n(10),N=n(45),M=function(e,t,n,i){return new(n||(n=Promise))((function(a,s){function o(e){try{c(i.next(e))}catch(e){s(e)}}function r(e){try{c(i.throw(e))}catch(e){s(e)}}function c(e){var t;e.done?a(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(o,r)}c((i=i.apply(e,t||[])).next())}))};let H,U=null;const B=new c.a("page-sign",!0,()=>{const e=()=>{t=g.default.countriesList.filter(e=>{var t;return!(null===(t=e.pFlags)||void 0===t?void 0:t.hidden)}).sort((e,t)=>(e.name||e.default_name).localeCompare(t.name||t.default_name))};let t;e(),D.default.addEventListener("language_change",()=>{e()});const c=new Map;let v,q;const z=document.createElement("div");z.classList.add("input-wrapper");const Q=new l.b({label:"Login.CountrySelectorLabel",name:Object(E.b)()});Q.container.classList.add("input-select");const V=Q.input,X=document.createElement("div");X.classList.add("select-wrapper","z-depth-3","hide");const W=document.createElement("span");W.classList.add("arrow","arrow-down"),Q.container.append(W);const Y=document.createElement("ul");X.appendChild(Y);new a.b(X);let $=()=>{$=null,t.forEach(e=>{const t=Object(C.c)(e.iso2),n=[];e.country_codes.forEach(i=>{const a=document.createElement("li");let s=r.a.wrapEmojiText(t);if(F.a){const e=document.createElement("span");e.innerHTML=s,a.append(e)}else a.innerHTML=s;const o=Object(g.i18n)(e.default_name);o.dataset.defaultName=e.default_name,a.append(o);const c=document.createElement("span");c.classList.add("phone-code"),c.innerText="+"+i.country_code,a.appendChild(c),n.push(a),Y.append(a)}),c.set(e.iso2,n)}),Y.addEventListener("mousedown",e=>{if(0!==e.button)return;const t=Object(b.a)(e.target,"LI");K(t)}),Q.container.appendChild(X)};const K=e=>{const n=e.childNodes[1].dataset.defaultName,i=e.querySelector(".phone-code").innerText,a=i.replace(/\D/g,"");Object(j.a)(V,Object(g.i18n)(n)),Object(A.a)(V,"input"),v=t.find(e=>e.default_name===n),q=v.country_codes.find(e=>e.country_code===a),te.value=te.lastValue=i,ee(),setTimeout(()=>{ne.focus(),Object(x.a)(ne,!0)},0)};let J;$(),V.addEventListener("focus",(function(e){$?$():t.forEach(e=>{c.get(e.iso2).forEach(e=>e.style.display="")}),clearTimeout(J),J=void 0,X.classList.remove("hide"),X.offsetWidth,X.classList.add("active"),Q.select(),Object(h.b)(B.pageEl.parentElement.parentElement,V,"start",4),setTimeout(()=>{G||(document.addEventListener("mousedown",Z,{capture:!0}),G=!0)},0)}));let G=!1;const Z=e=>{Object(y.a)(e.target,"input-select")||e.target!==V&&(ee(),document.removeEventListener("mousedown",Z,{capture:!0}),G=!1)},ee=()=>{void 0===J&&(X.classList.remove("active"),J=window.setTimeout(()=>{X.classList.add("hide"),J=void 0},200))};V.addEventListener("keyup",e=>{const n=Object(N.a)(e);if(e.ctrlKey||"Control"===n)return!1;let i=Q.value.toLowerCase(),a=[];t.forEach(e=>{let t=!![e.name,e.default_name].filter(Boolean).find(e=>-1!==e.toLowerCase().indexOf(i));c.get(e.iso2).forEach(e=>e.style.display=t?"":"none"),t&&a.push(e)}),0===a.length?t.forEach(e=>{c.get(e.iso2).forEach(e=>e.style.display="")}):1===a.length&&"Enter"===n&&K(c.get(a[0].iso2)[0])}),W.addEventListener("mousedown",(function(e){e.cancelBubble=!0,e.preventDefault(),V.matches(":focus")?V.blur():V.focus()}));const te=new R.a({onInput:e=>{f.b.loadLottieWorkers();const{country:t,code:n}=e||{};let i=t?t.name||t.default_name:"";i===Q.value||v&&t&&n&&(v===t||q.country_code===n.country_code)||(Object(j.a)(V,t?Object(g.i18n)(t.default_name):i),v=t,q=n),t||te.value.length-1>1?U.style.visibility="":U.style.visibility="hidden"}}),ne=te.input;ne.addEventListener("keypress",e=>{if(!U.style.visibility&&"Enter"===Object(N.a)(e))return ae()});const ie=new d.a({text:"Login.KeepSigned",name:"keepSession",withRipple:!0,checked:!0});ie.input.addEventListener("change",()=>{const e=ie.checked;s.default.pushToState("keepSigned",e),w.a.toggleStorage(e),L.a.toggleStorage(e),o.a.toggleStorage(e),P.a.toggleStorage(e)}),s.default.getState().then(e=>{s.default.storage.isAvailable()?ie.checked=e.keepSigned:(ie.checked=!1,ie.label.classList.add("checkbox-disabled"))}),U=Object(u.a)("btn-primary btn-color-primary",{text:"Login.Next"}),U.style.visibility="hidden";const ae=e=>{e&&Object(S.a)(e);const t=Object(k.a)([U,H],!0);Object(j.a)(U,Object(g.i18n)("PleaseWait")),Object(i.f)(U);let a=te.value;o.a.invokeApi("auth.sendCode",{phone_number:a,api_id:m.a.id,api_hash:m.a.hash,settings:{_:"codeSettings"}}).then(e=>{n.e(21).then(n.bind(null,23)).then(t=>t.default.mount(Object.assign(e,{phone_number:a})))}).catch(e=>{switch(t(),e.type){case"PHONE_NUMBER_INVALID":te.setError(),Object(j.a)(te.label,Object(g.i18n)("Login.PhoneLabelInvalid")),ne.classList.add("error"),Object(j.a)(U,Object(g.i18n)("Login.Next"));break;default:console.error("auth.sendCode error:",e),U.innerText=e.type}})};Object(T.b)(U,ae),H=Object(u.a)("btn-primary btn-secondary btn-primary-transparent primary",{text:"Login.QR.Login"});H.addEventListener("click",()=>{_.default.mount()}),z.append(Q.container,te.container,ie.label,U,H);const se=document.createElement("h4");se.classList.add("text-center"),Object(g._i18n)(se,"Login.Title");const oe=document.createElement("div");oe.classList.add("subtitle","text-center"),Object(g._i18n)(oe,"Login.StartText"),B.pageEl.querySelector(".container").append(se,oe,z);p.IS_TOUCH_SUPPORTED||setTimeout(()=>{ne.focus()},0),Object(O.a)(z),o.a.invokeApi("help.getNearestDc").then(e=>{var t;const n=I.a.getFromCache("langPack");n&&!(null===(t=n.countries)||void 0===t?void 0:t.hash)&&g.default.getLangPack(n.lang_code).then(()=>{Object(A.a)(ne,"input")});const i=new Set([1,2,3,4,5]),a=[e.this_dc];let s;return e.nearest_dc!==e.this_dc&&(s=o.a.getNetworker(e.nearest_dc).then(()=>{a.push(e.nearest_dc)})),(s||Promise.resolve()).then(()=>{a.forEach(e=>{i.delete(e)});const e=[...i],t=()=>M(void 0,void 0,void 0,(function*(){const n=e.shift();if(!n)return;const i=`dc${n}_auth_key`;if(yield P.a.get(i))return t();setTimeout(()=>{o.a.getNetworker(n).finally(t)},3e3)}));t()}),e}).then(e=>{Q.value.length||te.value.length||K(c.get(e.country)[0])})},()=>{U&&(Object(j.a)(U,Object(g.i18n)("Login.Next")),Object(v.ripple)(U,void 0,void 0,!0),U.removeAttribute("disabled")),H&&H.removeAttribute("disabled"),s.default.pushToState("authState",{_:"authStateSignIn"})});t.default=B},22:function(e,t,n){"use strict";n.r(t);var i=n(32),a=n(62),s=n(69),o=n(77),r=n(8),c=n(33),l=n(16),d=n(17),u=n(15),h=n(35),p=n(93),m=n(82),g=function(e,t,n,i){return new(n||(n=Promise))((function(a,s){function o(e){try{c(i.next(e))}catch(e){s(e)}}function r(e){try{c(i.throw(e))}catch(e){s(e)}}function c(e){var t;e.done?a(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(o,r)}c((i=i.apply(e,t||[])).next())}))};let f;const v=new a.a("page-signQR",!0,()=>f,()=>{f||(f=g(void 0,void 0,void 0,(function*(){const e=v.pageEl.querySelector(".auth-image");let t=Object(h.f)(e,!0);const a=document.createElement("div");a.classList.add("input-wrapper");const d=Object(c.a)("btn-primary btn-secondary btn-primary-transparent primary",{text:"Login.QR.Cancel"});a.append(d),Object(p.a)(a);const b=e.parentElement,y=document.createElement("h4");Object(l._i18n)(y,"Login.QR.Title");const E=document.createElement("ol");E.classList.add("qr-description"),["Login.QR.Help1","Login.QR.Help2","Login.QR.Help3"].forEach(e=>{const t=document.createElement("li");t.append(Object(l.i18n)(e)),E.append(t)}),b.append(y,E,a),d.addEventListener("click",()=>{Promise.all([n.e(3),n.e(30)]).then(n.bind(null,20)).then(e=>e.default.mount()),L=!0});const w=(yield Promise.all([n.e(10).then(n.t.bind(null,132,7))]))[0].default;let L=!1;u.default.addEventListener("user_auth",()=>{L=!0,f=null},{once:!0});let _,O={ignoreErrors:!0};const S=a=>g(void 0,void 0,void 0,(function*(){try{let c=yield i.a.invokeApi("auth.exportLoginToken",{api_id:r.a.id,api_hash:r.a.hash,except_ids:[]},{ignoreErrors:!0});if("auth.loginTokenMigrateTo"===c._&&(O.dcId||(O.dcId=c.dc_id,i.a.setBaseDcId(c.dc_id)),c=yield i.a.invokeApi("auth.importLoginToken",{token:c.token},O)),"auth.loginTokenSuccess"===c._){const e=c.authorization;return i.a.setUser(e.user),n.e(4).then(n.bind(null,19)).then(e=>e.default.mount()),!0}if(!_||!Object(o.b)(_,c.token)){_=c.token;let n="tg://login?token="+Object(o.d)(c.token).replace(/\+/g,"-").replace(/\//g,"_").replace(/\=+$/,"");const i=window.getComputedStyle(document.documentElement),a=i.getPropertyValue("--surface-color").trim(),s=i.getPropertyValue("--primary-text-color").trim(),r=i.getPropertyValue("--primary-color").trim(),l=yield fetch("assets/img/logo_padded.svg").then(e=>e.text()).then(e=>{e=e.replace(/(fill:).+?(;)/,`$1${r}$2`);const t=new Blob([e],{type:"image/svg+xml;charset=utf-8"});return new Promise(e=>{const n=new FileReader;n.onload=t=>{e(t.target.result)},n.readAsDataURL(t)})}),d=new w({width:240*window.devicePixelRatio,height:240*window.devicePixelRatio,data:n,image:l,dotsOptions:{color:s,type:"rounded"},cornersSquareOptions:{type:"extra-rounded"},imageOptions:{imageSize:1,margin:0},backgroundOptions:{color:a},qrOptions:{errorCorrectionLevel:"L"}});let u;d.append(e),e.lastChild.classList.add("qr-canvas"),u=d._drawingPromise?d._drawingPromise:Promise.race([Object(m.a)(1e3),new Promise(e=>{d._canvas._image.addEventListener("load",()=>{window.requestAnimationFrame(()=>e())},{once:!0})})]),yield u.then(()=>{if(t){t.style.animation="hide-icon .4s forwards";const n=e.children[1];n.style.display="none",n.style.animation="grow-icon .4s forwards",setTimeout(()=>{n.style.display=""},150),setTimeout(()=>{n.style.animation=""},500),t=void 0}else Array.from(e.children).slice(0,-1).forEach(e=>{e.remove()})})}if(a){let e=Date.now()/1e3,t=c.expires-e-s.a.serverTimeOffset;yield Object(m.a)(t>3?3e3:1e3*t|0)}}catch(e){switch(e.type){case"SESSION_PASSWORD_NEEDED":console.warn("pageSignQR: SESSION_PASSWORD_NEEDED"),e.handled=!0,n.e(16).then(n.bind(null,21)).then(e=>e.default.mount()),L=!0,f=null;break;default:console.error("pageSignQR: default error:",e),L=!0}return!0}return!1}));return()=>g(void 0,void 0,void 0,(function*(){for(L=!1;!L&&!(yield S(!0)););}))}))),f.then(e=>{e()}),d.default.pushToState("authState",{_:"authStateSignQr"})});t.default=v},23:function(e,t,n){"use strict";n.r(t);var i=n(37),a=n(17),s=n(32),o=n(62),r=n(20),c=n(110),l=n(111),d=n(16),u=n(67),h=n(36),p=function(e,t,n,i){return new(n||(n=Promise))((function(a,s){function o(e){try{c(i.next(e))}catch(e){s(e)}}function r(e){try{c(i.throw(e))}catch(e){s(e)}}function c(e){var t;e.done?a(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(o,r)}c((i=i.apply(e,t||[])).next())}))};let m,g=null,f=null,v=null;const b=new o.a("page-authCode",!0,()=>{const e=g.type.length,t=new l.a({label:"Code",name:Object(u.b)(),length:e,onFill:e=>{o(e)}});m=t.input,b.pageEl.querySelector(".input-wrapper").append(t.container);b.pageEl.querySelector(".phone-edit").addEventListener("click",(function(){return r.default.mount()}));const a=()=>{setTimeout(()=>{y.remove()},300)},o=e=>{m.setAttribute("disabled","true");const i={phone_number:g.phone_number,phone_code_hash:g.phone_code_hash,phone_code:e};s.a.invokeApi("auth.signIn",i,{ignoreErrors:!0}).then(e=>{switch(e._){case"auth.authorization":s.a.setUser(e.user),n.e(4).then(n.bind(null,19)).then(e=>{e.default.mount()}),a();break;case"auth.authorizationSignUpRequired":Promise.all([n.e(5),n.e(23)]).then(n.bind(null,25)).then(e=>{e.default.mount({phone_number:g.phone_number,phone_code_hash:g.phone_code_hash})}),a()}}).catch(e=>p(void 0,void 0,void 0,(function*(){let i=!1;switch(e.type){case"SESSION_PASSWORD_NEEDED":i=!0,e.handled=!0,yield(yield n.e(19).then(n.bind(null,21))).default.mount(),setTimeout(()=>{m.value=""},300);break;case"PHONE_CODE_EXPIRED":m.classList.add("error"),Object(h.a)(t.label,Object(d.i18n)("PHONE_CODE_EXPIRED"));break;case"PHONE_CODE_EMPTY":case"PHONE_CODE_INVALID":m.classList.add("error"),Object(h.a)(t.label,Object(d.i18n)("PHONE_CODE_INVALID"));break;default:t.label.innerText=e.type}i||t.select(),m.removeAttribute("disabled")})))},f=b.pageEl.querySelector(".auth-image"),v=i.b.isMobile?100:166,y=new c.a(t,v);return f.append(y.container),y.load()},e=>{if(g=e,f){m.value="";const e=document.createEvent("HTMLEvents");e.initEvent("input",!1,!0),m.dispatchEvent(e)}else f=b.pageEl.getElementsByClassName("phone")[0],v=b.pageEl.getElementsByClassName("sent-type")[0];let t,n;switch(f.innerText=g.phone_number,g.type._){case"auth.sentCodeTypeSms":t="Login.Code.SentSms";break;case"auth.sentCodeTypeApp":t="Login.Code.SentInApp";break;case"auth.sentCodeTypeCall":t="Login.Code.SentCall";break;default:t="Login.Code.SentUnknown",n=[g.type._]}Object(h.a)(v,Object(d.i18n)(t,n)),a.default.pushToState("authState",{_:"authStateAuthCode",sentCode:e})},()=>{m.focus()});t.default=b},30:function(e,t,n){"use strict";n.d(t,"a",(function(){return s})),n.d(t,"b",(function(){return o})),n.d(t,"c",(function(){return r})),n.d(t,"d",(function(){return c}));var i=n(1),a=n(53);const s=i.IS_TOUCH_SUPPORTED?"mousedown":"click";function o(e,t,n={}){const i=n.listenerSetter?n.listenerSetter.add(e):e.addEventListener.bind(e);n.touchMouseDown=!0,i(s,t,n)}function r(e,t,n){e.removeEventListener(s,t,n)}function c(e){Object(a.a)(e,s)}},33:function(e,t,n){"use strict";var i=n(16),a=n(18);t.a=(e,t={})=>{const n=document.createElement(t.asDiv?"div":"button");return n.className=e+(t.icon?" tgico-"+t.icon:""),t.noRipple||(t.rippleSquare&&n.classList.add("rp-square"),Object(a.ripple)(n)),t.onlyMobile&&n.classList.add("only-handhelds"),t.disabled&&n.setAttribute("disabled","true"),t.text&&n.append(Object(i.i18n)(t.text)),n}},35:function(e,t,n){"use strict";n.d(t,"f",(function(){return u})),n.d(t,"g",(function(){return h})),n.d(t,"c",(function(){return g})),n.d(t,"d",(function(){return y})),n.d(t,"e",(function(){return E})),n.d(t,"b",(function(){return _})),n.d(t,"a",(function(){return O}));var i=n(29),a=n(5),s=n(30),o=n(37),r=n(1),c=n(0),l=n(15),d=n(49);function u(e,t=!1){const n='\n  <svg xmlns="http://www.w3.org/2000/svg" class="preloader-circular" viewBox="25 25 50 50">\n  <circle class="preloader-path" cx="50" cy="50" r="20" fill="none" stroke-miterlimit="10"/>\n  </svg>';if(t){const t=document.createElement("div");return t.classList.add("preloader"),t.innerHTML=n,e&&e.appendChild(t),t}return e.insertAdjacentHTML("beforeend",n),e.lastElementChild}function h(e,t="check"){return e.classList.remove("tgico-"+t),e.disabled=!0,u(e),()=>{e.innerHTML="",e.classList.add("tgico-"+t),e.removeAttribute("disabled")}}i.a.putPreloader=u;let p=e=>{let t=f.getBoundingClientRect(),{clientX:n,clientY:i}=e,a=n>=t.right?n-t.right:t.left-n,s=i>=t.bottom?i-t.bottom:t.top-i;(a>=100||s>=100)&&g()};const m=e=>{g()},g=()=>{f&&(f.classList.remove("active"),f.parentElement.classList.remove("menu-open"),b&&b.remove(),f=null,l.default.dispatchEvent("context_menu_toggle",!1)),v&&(v(),v=null),r.IS_TOUCH_SUPPORTED||(window.removeEventListener("mousemove",p),window.removeEventListener("contextmenu",m)),document.removeEventListener(s.a,m),c.IS_MOBILE_SAFARI||d.a.removeByType("menu")};window.addEventListener("resize",()=>{f&&g()});let f=null,v=null,b=null;function y(e,t){g(),c.IS_MOBILE_SAFARI||d.a.pushItem({type:"menu",onPop:e=>{g()}}),f=e,f.classList.add("active"),f.parentElement.classList.add("menu-open"),b||(b=document.createElement("div"),b.classList.add("btn-menu-overlay"),b.addEventListener(s.a,e=>{Object(a.a)(e),m()})),f.parentElement.insertBefore(b,f),v=t,r.IS_TOUCH_SUPPORTED||(window.addEventListener("mousemove",p),window.addEventListener("contextmenu",m,{once:!0})),document.addEventListener(s.a,m),l.default.dispatchEvent("context_menu_toggle",!0)}function E({pageX:e,pageY:t},n,i){let{scrollWidth:a,scrollHeight:s}=n;const r=document.body.getBoundingClientRect(),c=r.width,l=r.height;i=o.b.isMobile?"right":"left";let d="top";const u={x:{left:e,right:e-a},intermediateX:"right"===i?8:c-a-8,y:{top:t,bottom:t-s},intermediateY:t<l/2?8:l-s-8},h={left:u.x.left+a+8<=c,right:u.x.right>=8},p={top:u.y.top+s+8<=l,bottom:u.y.bottom-8>=8};{let e;e=h[i]?u.x[i]:(i="center",u.intermediateX),n.style.left=e+"px"}{let e;e=p[d]?u.y[d]:(d="center",u.intermediateY),n.style.top=e+"px"}n.className=n.className.replace(/(top|center|bottom)-(left|center|right)/g,""),n.classList.add(("center"===d?d:"bottom")+"-"+("center"===i?i:"left"===i?"right":"left"))}let w=!1,L=0;function _(){L&&clearTimeout(L),L=window.setTimeout(()=>{L=0,w=!1},400),w=!0}function O(e,t,n){const i=n?n.add(e):e.addEventListener.bind(e),s=n?n.removeManual.bind(n,e):e.removeEventListener.bind(e);if(c.IS_APPLE&&r.IS_TOUCH_SUPPORTED){let n;const o={capture:!0},r=()=>{clearTimeout(n),s("touchmove",r,o),s("touchend",r,o),s("touchcancel",r,o)};i("touchstart",s=>{s.touches.length>1?r():(i("touchmove",r,o),i("touchend",r,o),i("touchcancel",r,o),n=window.setTimeout(()=>{w?r():(t(s.touches[0]),r(),f&&e.addEventListener("touchend",a.a,{once:!0}))},400))})}else i("contextmenu",r.IS_TOUCH_SUPPORTED?n=>{t(n),f&&e.addEventListener("touchend",a.a,{once:!0})}:t)}},45:function(e,t,n){"use strict";function i(e){let t=e.key;return t||(t=e.code,t.startsWith("Key")&&(t=e.code.slice(3),!e.shiftKey&&t.length<2&&(t=t.toLowerCase()))),t}n.d(t,"a",(function(){return i}))},49:function(e,t,n){"use strict";var i=n(29),a=n(0),s=n(43),o=n(7),r=n(5),c=n(44),l=n(73),d=n(45);const u=new class{constructor(){this.navigations=[],this.id=Date.now(),this.manual=!1,this.log=Object(s.b)("NC"),this.debug=!0,this.currentHash=window.location.hash;let e=!1;if(window.addEventListener("popstate",t=>{if(this.debug&&this.log("popstate",t,e),window.location.hash!==this.currentHash)return this.onHashChange&&this.onHashChange(),void this.replaceState();this.currentHash=window.location.hash;if(t.state!==this.id)return void this.pushState();const n=this.navigations.pop();n?(this.manual=!e,this.handleItem(n)):this.pushState()}),window.addEventListener("keydown",e=>{const t=this.navigations[this.navigations.length-1];t&&("Escape"!==Object(d.a)(e)||t.onEscape&&!t.onEscape()||(Object(r.a)(e),this.back(t.type)))},{capture:!0,passive:!1}),a.IS_MOBILE_SAFARI){const t={passive:!0};window.addEventListener("touchstart",t=>{t.touches.length>1||(this.debug&&this.log("touchstart"),Object(l.a)(t)&&(e=!0,window.addEventListener("touchend",()=>{setTimeout(()=>{e=!1},100)},{passive:!0,once:!0})))},t)}history.scrollRestoration="manual",this.pushState()}handleItem(e){const t=e.onPop(!!this.manual&&void 0);this.debug&&this.log("popstate, navigation:",e,this.navigations),!1===t?this.pushItem(e):e.noBlurOnPop||Object(o.a)(),this.manual=!1}findItemByType(e){for(let t=this.navigations.length-1;t>=0;--t){const n=this.navigations[t];if(n.type===e)return{item:n,index:t}}}back(e){if(e){const t=this.findItemByType(e);if(t)return this.manual=!0,this.navigations.splice(t.index,1),void this.handleItem(t.item)}history.back()}pushItem(e){this.navigations.push(e),this.debug&&this.log("pushstate",e,this.navigations),e.noHistory||this.pushState()}pushState(){this.manual=!1,history.pushState(this.id,"")}replaceState(){history.replaceState(this.id,"",location.origin+location.pathname)}removeItem(e){Object(c.e)(this.navigations,e)}removeByType(e,t=!1){for(let n=this.navigations.length-1;n>=0;--n){if(this.navigations[n].type===e&&(this.navigations.splice(n,1),t))break}}};i.a.appNavigationController=u,t.a=u},53:function(e,t,n){"use strict";function i(e,t){const n=new Event(t,{bubbles:!0,cancelable:!0});e.dispatchEvent(n)}n.d(t,"a",(function(){return i}))},59:function(e,t,n){"use strict";var i=n(41),a=n(46),s=n(29),o=n(61);const r=new class{constructor(){this.promises={},this.raf=i.b.bind(null),this.scheduled=!1}do(e,t){let n=this.promises[e];return n||(this.scheduleFlush(),n=this.promises[e]=Object(a.a)()),void 0!==t&&n.then(()=>t()),n}measure(e){return this.do("read",e)}mutate(e){return this.do("write",e)}mutateElement(e,t){const n=Object(o.a)(e)?this.mutate():Promise.resolve();return void 0!==t&&n.then(()=>t()),n}scheduleFlush(){this.scheduled||(this.scheduled=!0,this.raf(()=>{this.promises.read&&this.promises.read.resolve(),this.promises.write&&this.promises.write.resolve(),this.scheduled=!1,this.promises={}}))}};s.a&&(s.a.sequentialDom=r),t.a=r},69:function(e,t,n){"use strict";var i=n(29),a=n(66),s=n(32);const o=new class{constructor(){this.serverTimeOffset=0,a.a.get("server_time_offset").then(e=>{e&&(this.serverTimeOffset=e)}),s.a.addTaskListener("applyServerTimeOffset",e=>{this.serverTimeOffset=e.payload})}};i.a&&(i.a.serverTimeManager=o),t.a=o},73:function(e,t,n){"use strict";n.d(t,"a",(function(){return a}));var i=n(0);function a(e){return i.IS_MOBILE_SAFARI&&e instanceof TouchEvent&&e.touches[0].clientX<30}},77:function(e,t,n){"use strict";function i(e){const t=e.length,n=new Array(t);for(let i=0;i<t;++i)n[i]=(e[i]<16?"0":"")+(e[i]||0).toString(16);return n.join("")}function a(e){const t=e.length,n=new Uint8Array(Math.ceil(t/2));let i=0;t%2&&(n[i++]=parseInt(e.charAt(0),16));for(let a=i;a<t;a+=2)n[i++]=parseInt(e.substr(a,2),16);return n}function s(e){let t,n="";for(let i=e.length,a=0,s=0;s<i;++s)t=s%3,a|=e[s]<<(16>>>t&24),2!==t&&i-s!=1||(n+=String.fromCharCode(o(a>>>18&63),o(a>>>12&63),o(a>>>6&63),o(63&a)),a=0);return n.replace(/A(?=A$|$)/g,"=")}function o(e){return e<26?e+65:e<52?e+71:e<62?e-4:62===e?43:63===e?47:65}function r(e,t){const n=e.length;if(n!==t.length)return!1;for(let i=0;i<n;++i)if(e[i]!==t[i])return!1;return!0}function c(...e){const t=e.reduce((e,t)=>e+(t.byteLength||t.length),0),n=new Uint8Array(t);let i=0;return e.forEach(e=>{n.set(e instanceof ArrayBuffer?new Uint8Array(e):e,i),i+=e.byteLength||e.length}),n}n.d(t,"e",(function(){return i})),n.d(t,"c",(function(){return a})),n.d(t,"d",(function(){return s})),n.d(t,"b",(function(){return r})),n.d(t,"a",(function(){return c}))},93:function(e,t,n){"use strict";n.d(t,"a",(function(){return p}));var i=n(5),a=n(30),s=n(9),o=n(16),r=n(32),c=n(15),l=n(33),d=n(35);let u,h=!1;function p(e){h||(u||(u=r.a.getConfig().then(e=>e.suggested_lang_code!==o.default.lastRequestedLangCode?Promise.all([e,o.default.getStrings(e.suggested_lang_code,["Login.ContinueOnLanguage"]),o.default.getCacheLangPack()]):[]))).then(([t,n])=>{if(!t)return;const r=[];n.forEach(e=>{const t=o.default.strings.get(e.key);t&&(r.push(t),o.default.strings.set(e.key,e))});const u=Object(l.a)("btn-primary btn-secondary btn-primary-transparent primary",{text:"Login.ContinueOnLanguage"});u.lastElementChild.classList.remove("i18n"),Object(s.a)().then(()=>{window.requestAnimationFrame(()=>{e.append(u)})}),c.default.addEventListener("language_change",()=>{u.remove()},{once:!0}),r.forEach(e=>{o.default.strings.set(e.key,e)}),Object(a.b)(u,e=>{Object(i.a)(e),h=!0,u.disabled=!0,Object(d.f)(u),o.default.getLangPack(t.suggested_lang_code)})})}}}]);
//# sourceMappingURL=13.273f09ee16af87121a28.chunk.js.map