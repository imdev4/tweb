import {createSignal, createEffect} from 'solid-js';
import {DrawType} from './types';
import Section from '../section';
import {i18n} from '../../lib/langPack';

type DrawTypeIconProps = {
  type: DrawType;
  isActive: boolean;
  color?: string;
}

type IconProps = Pick<DrawTypeIconProps, 'color'>

function Arrow(props: IconProps) {
  return <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="arrow_svg__mask0_1_3" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="20">
      <path d="M120 20V0H0V20H120Z" fill="white" />
    </mask>
    <g mask="url(#arrow_svg__mask0_1_3)">
      <path d="M94 10H110M110 10L104 4M110 10L104 16" stroke="url(#arrow_svg__paint0_linear_1_3)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <g filter="url(#arrow_svg__filter0_iiii_1_3)">
        <path d="M0 1H92C94.2091 1 96 2.79086 96 5V15C96 17.2091 94.2091 19 92 19H0V1Z" fill="#3E3F3F" />
      </g>
      <path d="M92 1C94.2091 1 96 2.79086 96 5V15C96 17.2091 94.2091 19 92 19V1Z" fill={props.color} />
    </g>
    <defs>
      <filter id="arrow_svg__filter0_iiii_1_3" x="0" y="-4" width="99" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="5" />
        <feGaussianBlur stdDeviation="3" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0" />
        <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_3" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="3" dy="-5" />
        <feGaussianBlur stdDeviation="3" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0" />
        <feBlend mode="normal" in2="effect1_innerShadow_1_3" result="effect2_innerShadow_1_3" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="-1" />
        <feGaussianBlur stdDeviation="0.5" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0" />
        <feBlend mode="normal" in2="effect2_innerShadow_1_3" result="effect3_innerShadow_1_3" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="1" />
        <feGaussianBlur stdDeviation="0.5" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0" />
        <feBlend mode="normal" in2="effect3_innerShadow_1_3" result="effect4_innerShadow_1_3" />
      </filter>
      <linearGradient id="arrow_svg__paint0_linear_1_3" x1="110" y1="10" x2="94" y2="10" gradientUnits="userSpaceOnUse">
        <stop offset="0.755" stop-color={props.color} />
        <stop offset="1" stop-color={props.color} stop-opacity="0" />
      </linearGradient>
    </defs>
  </svg>;
}

function Brush(props: IconProps) {
  return <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="brush_svg__mask0_1_12" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="20">
      <path d="M120 20V0H0V20H120Z" fill="white" />
    </mask>
    <g mask="url(#brush_svg__mask0_1_12)">
      <g filter="url(#brush_svg__filter0_iiii_1_12)">
        <path d="M0 1H82.3579C83.4414 1 84.5135 1.22006 85.5093 1.64684L91 4H101C101.552 4 102 4.44772 102 5V15C102 15.5523 101.552 16 101 16H91L85.5093 18.3532C84.5135 18.7799 83.4414 19 82.3579 19H0V1Z" fill="#3E3F3F" />
      </g>
      <path d="M79.5 1H76.5C76.2239 1 76 1.22386 76 1.5V18.5C76 18.7761 76.2239 19 76.5 19H79.5C79.7761 19 80 18.7761 80 18.5V1.5C80 1.22386 79.7761 1 79.5 1Z" fill={props.color} />
      <path d="M102 5H106.434C106.785 5 107.111 5.1843 107.291 5.4855L112.091 13.4855C112.491 14.152 112.011 15 111.234 15H102V5Z" fill={props.color} />
    </g>
    <defs>
      <filter id="brush_svg__filter0_iiii_1_12" x="0" y="-4" width="105" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="5" />
        <feGaussianBlur stdDeviation="3" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0" />
        <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_12" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="3" dy="-5" />
        <feGaussianBlur stdDeviation="3" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0" />
        <feBlend mode="normal" in2="effect1_innerShadow_1_12" result="effect2_innerShadow_1_12" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="-1" />
        <feGaussianBlur stdDeviation="0.5" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0" />
        <feBlend mode="normal" in2="effect2_innerShadow_1_12" result="effect3_innerShadow_1_12" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="1" />
        <feGaussianBlur stdDeviation="0.5" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0" />
        <feBlend mode="normal" in2="effect3_innerShadow_1_12" result="effect4_innerShadow_1_12" />
      </filter>
    </defs>
  </svg>;
}

function Blur(props: IconProps) {
  return <svg width="117" height="20" viewBox="0 0 117 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#blur_svg__filter0_f_2_2)">
      <path d="M112 10C112 12.7614 109.761 15 107 15C104.95 15 103.743 12.9774 101.5 12C99.2358 11.0133 95.5 14 95.5 10C95.5 6 99.1783 8.96962 101.416 8C103.687 7.0158 104.95 5 107 5C109.761 5 112 7.23858 112 10Z" fill="white" />
      <path d="M112 10C112 12.7614 109.761 15 107 15C104.95 15 103.743 12.9774 101.5 12C99.2358 11.0133 95.5 14 95.5 10C95.5 6 99.1783 8.96962 101.416 8C103.687 7.0158 104.95 5 107 5C109.761 5 112 7.23858 112 10Z" fill="url(#blur_svg__c)" />
    </g>
    <g filter="url(#blur_svg__filter1_f_2_2)">
      <path d="M112 10C112 12.7614 109.761 15 107 15C104.95 15 103.743 12.9774 101.5 12C99.2358 11.0133 95.5 14 95.5 10C95.5 6 99.1783 8.96962 101.416 8C103.687 7.0158 104.95 5 107 5C109.761 5 112 7.23858 112 10Z" fill="white" />
      <path d="M112 10C112 12.7614 109.761 15 107 15C104.95 15 103.743 12.9774 101.5 12C99.2358 11.0133 95.5 14 95.5 10C95.5 6 99.1783 8.96962 101.416 8C103.687 7.0158 104.95 5 107 5C109.761 5 112 7.23858 112 10Z" fill="url(#blur_svg__c)" />
    </g>
    <g filter="url(#blur_svg__filter2_f_2_2)">
      <path d="M112 10C112 12.7614 109.761 15 107 15C104.95 15 103.743 12.9774 101.5 12C99.2358 11.0133 95.5 14 95.5 10C95.5 6 99.1783 8.96962 101.416 8C103.687 7.0158 104.95 5 107 5C109.761 5 112 7.23858 112 10Z" fill="white" />
      <path d="M112 10C112 12.7614 109.761 15 107 15C104.95 15 103.743 12.9774 101.5 12C99.2358 11.0133 95.5 14 95.5 10C95.5 6 99.1783 8.96962 101.416 8C103.687 7.0158 104.95 5 107 5C109.761 5 112 7.23858 112 10Z" fill="url(#blur_svg__c)" />
    </g>
    <g filter="url(#blur_svg__filter3_iiii_2_2)">
      <path d="M0 1H77.441C77.7836 1 78.0968 1.19357 78.25 1.5C78.4032 1.80643 78.7164 2 79.059 2H94.941C95.2836 2 95.5968 1.80643 95.75 1.5C95.9032 1.19357 96.2164 1 96.559 1H100C101.105 1 102 1.89543 102 3V17C102 18.1046 101.105 19 100 19H96.559C96.2164 19 95.9032 18.8064 95.75 18.5C95.5968 18.1936 95.2836 18 94.941 18H79.059C78.7164 18 78.4032 18.1936 78.25 18.5C78.0968 18.8064 77.7836 19 77.441 19H0V1Z" fill="#3E3F3F" />
    </g>
    <g filter="url(#blur_svg__filter4_f_2_2)">
      <path d="M112 10C112 12.7614 109.761 15 107 15C104.95 15 103.743 12.9774 101.5 12C99.2358 11.0133 101.416 14 101.416 10C101.416 6 99.1783 8.96962 101.416 8C103.687 7.0158 104.95 5 107 5C109.761 5 112 7.23858 112 10Z" fill="white" />
      <path d="M112 10C112 12.7614 109.761 15 107 15C104.95 15 103.743 12.9774 101.5 12C99.2358 11.0133 101.416 14 101.416 10C101.416 6 99.1783 8.96962 101.416 8C103.687 7.0158 104.95 5 107 5C109.761 5 112 7.23858 112 10Z" fill="url(#blur_svg__c)" />
    </g>
    <mask id="blur_svg__mask0_2_2" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="2" y="1" width="100" height="18">
      <path d="M2 1H77.441C77.7836 1 78.0968 1.19357 78.25 1.5C78.4032 1.80643 78.7164 2 79.059 2H94.941C95.2836 2 95.5968 1.80643 95.75 1.5C95.9032 1.19357 96.2164 1 96.559 1H100C101.105 1 102 1.89543 102 3V17C102 18.1046 101.105 19 100 19H96.559C96.2164 19 95.9032 18.8064 95.75 18.5C95.5968 18.1936 95.2836 18 94.941 18H79.059C78.7164 18 78.4032 18.1936 78.25 18.5C78.0968 18.8064 77.7836 19 77.441 19H2V1Z" fill="#3E3F3F" />
    </mask>
    <g mask="url(#blur_svg__mask0_2_2)">
      <path d="M79 19V1H78V19H79Z" fill="black" fill-opacity="0.33" />
      <path d="M96 19V1H95V19H96Z" fill="black" fill-opacity="0.33" />
    </g>
    <defs>
      <filter id="blur_svg__filter0_f_2_2" x="90.5" y="0" width="26.5" height="20" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation="2.5" result="effect1_foregroundBlur_2_2" />
      </filter>
      <filter id="blur_svg__filter1_f_2_2" x="90.5" y="0" width="26.5" height="20" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation="2.5" result="effect1_foregroundBlur_2_2" />
      </filter>
      <filter id="blur_svg__filter2_f_2_2" x="90.5" y="0" width="26.5" height="20" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation="2.5" result="effect1_foregroundBlur_2_2" />
      </filter>
      <filter id="blur_svg__filter3_iiii_2_2" x="0" y="-4" width="105" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="5" />
        <feGaussianBlur stdDeviation="3" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0" />
        <feBlend mode="normal" in2="shape" result="effect1_innerShadow_2_2" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="3" dy="-5" />
        <feGaussianBlur stdDeviation="3" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0" />
        <feBlend mode="normal" in2="effect1_innerShadow_2_2" result="effect2_innerShadow_2_2" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="-1" />
        <feGaussianBlur stdDeviation="0.5" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0" />
        <feBlend mode="normal" in2="effect2_innerShadow_2_2" result="effect3_innerShadow_2_2" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="1" />
        <feGaussianBlur stdDeviation="0.5" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0" />
        <feBlend mode="normal" in2="effect3_innerShadow_2_2" result="effect4_innerShadow_2_2" />
      </filter>
      <filter id="blur_svg__filter4_f_2_2" x="95.4215" y="0" width="21.5785" height="20" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation="2.5" result="effect1_foregroundBlur_2_2" />
      </filter>
      <radialGradient id="blur_svg__c" fx="50%" fy="50%" r="50%">
        <stop offset="0%" style="stop-color:red" />
        <stop offset="16.67%" style="stop-color:yellow" />
        <stop offset="33.33%" style="stop-color:lime" />
        <stop offset="50%" style="stop-color:aqua" />
        <stop offset="66.67%" style="stop-color:blue" />
        <stop offset="83.33%" style="stop-color:magenta" />
        <stop offset="100%" style="stop-color:red" />
      </radialGradient>
    </defs>
  </svg>;
}

function Neon(props: IconProps) {
  return <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="neon_svg__mask0_1_21" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="20">
      <path d="M120 20V0H0V20H120Z" fill="white" />
    </mask>
    <g mask="url(#neon_svg__mask0_1_21)">
      <g filter="url(#neon_svg__filter0_f_1_21)">
        <path d="M102 5H107.146C108.282 5 109.323 5.64872 109.601 6.75061C109.813 7.59297 110 8.70303 110 10C110 11.297 109.813 12.407 109.601 13.2494C109.323 14.3513 108.282 15 107.146 15H102V5Z" fill={props.color} />
      </g>
      <g filter="url(#neon_svg__filter1_f_1_21)">
        <path d="M102 5H107.146C108.282 5 109.323 5.64872 109.601 6.75061C109.813 7.59297 110 8.70303 110 10C110 11.297 109.813 12.407 109.601 13.2494C109.323 14.3513 108.282 15 107.146 15H102V5Z" fill={props.color} />
      </g>
      <g filter="url(#neon_svg__filter2_f_1_21)">
        <path d="M102 5H107.146C108.282 5 109.323 5.64872 109.601 6.75061C109.813 7.59297 110 8.70303 110 10C110 11.297 109.813 12.407 109.601 13.2494C109.323 14.3513 108.282 15 107.146 15H102V5Z" fill={props.color} />
      </g>
      <g filter="url(#neon_svg__filter3_iiii_1_21)">
        <path d="M0 1H82.3579C83.4414 1 84.5135 1.22006 85.5093 1.64684L91 4H101C101.552 4 102 4.44772 102 5V15C102 15.5523 101.552 16 101 16H91L85.5093 18.3532C84.5135 18.7799 83.4414 19 82.3579 19H0V1Z" fill="#3E3F3F" />
      </g>
      <path d="M79.5 1H76.5C76.2239 1 76 1.22386 76 1.5V18.5C76 18.7761 76.2239 19 76.5 19H79.5C79.7761 19 80 18.7761 80 18.5V1.5C80 1.22386 79.7761 1 79.5 1Z" fill={props.color} />
      <path d="M102 5H107.146C108.282 5 109.323 5.64872 109.601 6.75061C109.813 7.59297 110 8.70303 110 10C110 11.297 109.813 12.407 109.601 13.2494C109.323 14.3513 108.282 15 107.146 15H102V5Z" fill={props.color} />
    </g>
    <defs>
      <filter id="neon_svg__filter0_f_1_21" x="96" y="-1" width="20" height="22" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation="3" result="effect1_foregroundBlur_1_21" />
      </filter>
      <filter id="neon_svg__filter1_f_1_21" x="96" y="-1" width="20" height="22" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation="3" result="effect1_foregroundBlur_1_21" />
      </filter>
      <filter id="neon_svg__filter2_f_1_21" x="96" y="-1" width="20" height="22" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation="3" result="effect1_foregroundBlur_1_21" />
      </filter>
      <filter id="neon_svg__filter3_iiii_1_21" x="0" y="-4" width="105" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="5" />
        <feGaussianBlur stdDeviation="3" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0" />
        <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_21" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="3" dy="-5" />
        <feGaussianBlur stdDeviation="3" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0" />
        <feBlend mode="normal" in2="effect1_innerShadow_1_21" result="effect2_innerShadow_1_21" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="-1" />
        <feGaussianBlur stdDeviation="0.5" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0" />
        <feBlend mode="normal" in2="effect2_innerShadow_1_21" result="effect3_innerShadow_1_21" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="1" />
        <feGaussianBlur stdDeviation="0.5" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0" />
        <feBlend mode="normal" in2="effect3_innerShadow_1_21" result="effect4_innerShadow_1_21" />
      </filter>
    </defs>
  </svg>;
}

function Pen(props: IconProps) {
  return <svg width="120" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#pen_svg__a)">
      <g filter="url(#pen_svg__b)">
        <path d="M0 1h80l30.2 7.447c1.848.455 2.771.683 2.985 1.046a1 1 0 0 1 0 1.014c-.214.363-1.137.59-2.985 1.046L80 19H0V1Z" fill="#3E3F3F" />
      </g>
      <path d="m112.564 10.97-9.09 2.243a.483.483 0 0 1-.591-.356c-.147-.642-.383-1.827-.383-2.857 0-1.03.236-2.215.383-2.857a.483.483 0 0 1 .591-.356l9.09 2.242c1.014.25 1.014 1.692 0 1.942Z" fill={props.color} />
      <rect x="76" y="1" width="4" height="18" rx=".5" fill={props.color} />
    </g>
    <defs>
      <clipPath id="pen_svg__a">
        <path fill="#fff" transform="rotate(90 60 60)" d="M0 0h20v120H0z" />
      </clipPath>
      <filter id="pen_svg__b" x="0" y="-4" width="116.323" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="5" />
        <feGaussianBlur stdDeviation="3" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0" />
        <feBlend in2="shape" result="effect1_innerShadow_5477_488" />
        <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="3" dy="-5" />
        <feGaussianBlur stdDeviation="3" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0" />
        <feBlend in2="effect1_innerShadow_5477_488" result="effect2_innerShadow_5477_488" />
        <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="-1" />
        <feGaussianBlur stdDeviation=".5" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0" />
        <feBlend in2="effect2_innerShadow_5477_488" result="effect3_innerShadow_5477_488" />
        <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="1" />
        <feGaussianBlur stdDeviation=".5" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0" />
        <feBlend in2="effect3_innerShadow_5477_488" result="effect4_innerShadow_5477_488" />
      </filter>
    </defs>
  </svg>;
}

function Eraser(props: IconProps) {
  return <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="eraser_svg__mask0_1_36" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="20">
      <path d="M120 20V0H0V20H120Z" fill="white" />
    </mask>
    <g mask="url(#eraser_svg__mask0_1_36)">
      <g filter="url(#eraser_svg__filter0_i_1_36)">
        <path d="M95 1H108C110.209 1 112 2.79086 112 5V15C112 17.2091 110.209 19 108 19H95V1Z" fill="#D9D9D9" />
        <path d="M95 1H108C110.209 1 112 2.79086 112 5V15C112 17.2091 110.209 19 108 19H95V1Z" fill="#F09B99" />
      </g>
      <g filter="url(#eraser_svg__filter1_iiii_1_36)">
        <path d="M0 1H77.6464C77.8728 1 78.0899 0.910072 78.25 0.75C78.4101 0.589928 78.6272 0.5 78.8536 0.5H96C97.1046 0.5 98 1.39543 98 2.5V17.5C98 18.6046 97.1046 19.5 96 19.5H78.8536C78.6272 19.5 78.4101 19.4101 78.25 19.25C78.0899 19.0899 77.8728 19 77.6464 19H0V1Z" fill="#3E3F3F" />
      </g>
      <path d="M79 19.5V0.5H78V19.5H79Z" fill="black" fill-opacity="0.33" />
    </g>
    <defs>
      <filter id="eraser_svg__filter0_i_1_36" x="95" y="-1" width="19" height="20" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="2" dy="-2" />
        <feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.33 0" />
        <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_36" />
      </filter>
      <filter id="eraser_svg__filter1_iiii_1_36" x="0" y="-4.5" width="101" height="29" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="5" />
        <feGaussianBlur stdDeviation="3" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0" />
        <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1_36" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="3" dy="-5" />
        <feGaussianBlur stdDeviation="3" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.145098 0 0 0 0 0.14902 0 0 0 1 0" />
        <feBlend mode="normal" in2="effect1_innerShadow_1_36" result="effect2_innerShadow_1_36" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="-1" />
        <feGaussianBlur stdDeviation="0.5" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0" />
        <feBlend mode="normal" in2="effect2_innerShadow_1_36" result="effect3_innerShadow_1_36" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="1" dy="1" />
        <feGaussianBlur stdDeviation="0.5" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.242217 0 0 0 0 0.247242 0 0 0 0 0.247101 0 0 0 1 0" />
        <feBlend mode="normal" in2="effect3_innerShadow_1_36" result="effect4_innerShadow_1_36" />
      </filter>
    </defs>
  </svg>;
}

function getDefaultColor(type: DrawType) {
  if(type === DrawType.Arrow) {
    return '255, 214, 10';
  }
  if(type === DrawType.Pen) {
    return '254, 68, 56';
  }
  if(type === DrawType.Brush) {
    return '255, 137, 1';
  }
  if(type === DrawType.Neon) {
    return '98, 229, 224';
  }

  return '255, 255, 255';
}

/**
 * Icon for DrawType
 */
function DrawTypeIcon(props: DrawTypeIconProps) {
  const [color, setColor] = createSignal(getDefaultColor(props.type));

  createEffect(() => {
    if(props.isActive) {
      setColor(props.color);
    }
  });

  switch(props.type) {
    case DrawType.Arrow:
      return <Arrow color={`rgb(${color()})`} />;
    case DrawType.Brush:
      return <Brush color={`rgb(${color()})`} />;
    case DrawType.Blur:
      return <Blur color={`rgb(${color()})`} />;
    case DrawType.Neon:
      return <Neon color={`rgb(${color()})`} />;
    case DrawType.Pen:
      return <Pen color={`rgb(${color()})`} />;
    case DrawType.Eraser:
      return <Eraser color={`rgb(${color()})`} />;

    default:
      throw new Error('Unkonwn Draw Type')
  };
}

type DrawTypes = {
  items: DrawType[];
  selectedType: DrawType;
  color: string;
  onChange(newDrawType: DrawType): void;
}

/**
 * List with draw types
 */
export function DrawTypes(props: DrawTypes) {
  return <Section class="draw-type-picker">
    <div class="draw-row-text">{i18n('MediaEditor.Popup.Tool')}</div>
    {props.items.map(item => {
      const isSelected = props.selectedType === item;
      return <div class={`draw-type section-item ${isSelected ? 'active' : ''}`} aria-label={item} onClick={() => props.onChange(item)}>
        <DrawTypeIcon type={item} isActive={isSelected} color={props.color} />
        <div class="draw-type-title">{item}</div>
      </div>
    })}
  </Section>
}
