import './style.scss';
//import bezierEasing from "https://cdn.skypack.dev/bezier-easing@2.1.0";

/*
const bezier = {
  ease: bezierEasing(0.25, 0.1, 0.25, 1.0),
  easeIn: bezierEasing(0.38, 0.01, 0.78, 0.13),
  midSlow: bezierEasing(0, 0.7, 1, 0.3),
};*/


/*
const bezier = {
  midSlow: (num: number) => num,
};

interface ScrollAnimationStyle {
  name: 'opacity' | 'translateX' | 'translateY';
  topValue: number;
  bottomValue: number;
}

interface ScrollAnimation {
  enabled: boolean;
  top: number;
  bottom: number;
  timingFunction: (num: number) => number;
  styles: ScrollAnimationStyle[];
}

interface ScrollComponent {
  element: HTMLElement;
  top: number;
  bottom: number;
  terminalStyle: ScrollAnimationStyle[];
  animations: ScrollAnimation[];
}

const components: Map<string, ScrollComponent> = new Map([

  [
    'slide1',
    {
      element: document.getElementById('slide1')!,
      top: 500,
      bottom: 1900,
      terminalStyle: [
        {
          name: 'opacity',
          topValue: 0,
          bottomValue: 0,
        },
        {
          name: 'translateY',
          topValue: -60,
          bottomValue: 60,
        }
      ],
      animations: [
        {
          enabled: false,
          top: 500,
          bottom: 1900,
          timingFunction: bezier.midSlow,
          styles: [
            {
              name: 'translateY',
              topValue: 60,
              bottomValue: -60,
            },
          ]
        },

        {
          enabled: false,
          top: 500,
          bottom: 800,
          timingFunction: bezier.midSlow,
          styles: [
            {
              name: 'opacity',
              topValue: 0,
              bottomValue: 1,
            }
          ]
        },

        {
          enabled: false,
          top: 1400,
          bottom: 1900,
          timingFunction: bezier.midSlow,
          styles: [
            {
              name: 'opacity',
              topValue: 1,
              bottomValue: 0,
            }
          ]
        },
      ]
    }
  ],



]);

let enabled = new Map<string, ScrollComponent>();
let disabled = new Map<string, ScrollComponent>();

const elements = {
  sticky_container: document.getElementById('sticky-container')!
};

function isIn(num: number, top: number, bottom: number): boolean {
  return top <= num && bottom >= num;
}

// 현재 스크롤 위치 파악
function onScroll() {
  const scrollTop = window.scrollY || window.pageYOffset;
  const currentPos = scrollTop + window.innerHeight/2;

  disabled.forEach((component, id) => {
    if(isIn(currentPos, component.top, component.bottom)) {
      enabled.set(id, component);
      components.get(id)?.element?.classList.add('enabled');
      disabled.delete(id);
    }
  });

  enabled.forEach((component, id) => {
    if(!isIn(currentPos, component.top, component.bottom)) {
      if(currentPos < component.top) {
        
      } else if(currentPos > component.bottom) {

      }

      disabled.set(id, component);
      components.get(id)?.element?.classList.remove(id);
      enabled.delete(id);
    } else {
      applyAnimations(currentPos, id);
    }
  });



  console.log(`onScroll: ${currentPos} / enabledCount: ${enabled.size}`);
}

function initAnimation() {
  elements.sticky_container.style.height = '7100px';

  components.forEach((obj, id) => {
    disabled.set(id, obj);
    for(let style of Object.entries(obj.terminalStyle)) {
      applyStyle(id, style[0], style[1].topValue);
    }
  });

  onScroll();
}

initAnimation();
window.addEventListener('scroll', onScroll);

function applyStyle(id: string, styleName: string, value: number) {
  if(styleName == 'translateX')
    components.get(id)?.element?.style.setProperty('transform', `translateX(${value}px)`);
  else if(styleName == 'translateY')
    components.get(id)?.element?.style.setProperty('transform', `translateY(${value}px)`);
  else
    components.get(id)?.element?.style.setProperty(styleName, value.toString());
  
  console.log(`Style: ${styleName}: ${value}`);
}

function applyStyles(id: string, styles: ScrollAnimationStyle[], rate: number) {
  styles.forEach( (style) => {
    const value = style.topValue + (style.bottomValue - style.topValue) * rate;
    applyStyle(id, style.name, value);
  });
}

function applyAnimations(currentPos: number, id: string) {
  const animations = components.get(id)?.animations;

  if(!animations) return;

  animations.forEach((animation) => {
    const {top: a_top, bottom: a_bottom, timingFunction, styles} = animation;
    const checkIn = isIn(currentPos, a_top, a_bottom);

    if(checkIn && !animation.enabled) {
      animation.enabled = true;
    } else if(!checkIn && animation.enabled) {
      if(currentPos < a_top) {
        applyStyles(id, styles, 0);
      } else if(currentPos > a_bottom) {
        applyStyles(id, styles, 1);
      }
    }

    if(animation.enabled) {
      const rate = timingFunction((currentPos - a_top) / (a_bottom - a_top));
      applyStyles(id, styles, rate);
    }
  });
}

*/