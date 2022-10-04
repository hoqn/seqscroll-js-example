import './sequence_scroll.scss';

import bezierEasing from 'bezier-easing';

import OptLineParser, {OptFunction} from './function_parser';

const Y_BEFORE = -1;
const Y_BETWEEN = 0;
const Y_AFTER = 1;

export declare type AnimatableTimingFunction =
    'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | `cubic-bezier(${any})`;

function loadTimingFunctions(str: string): ((num: number) => number)[] {
    str?.toLowerCase();

    const parser = new OptLineParser(str);
    const options = parser.parseLine();

    let result: ((num: number) => number)[] = [];

    for(let opt of options.options) {
        if(opt.type == 'function') {
            const optFunction = opt as OptFunction;
            switch (optFunction.name) {
                case 'ease': optFunction.args = [.25, .1, .25, 1]; break;
                case 'ease-in': optFunction.args = [.42, 0, 1, 1]; break;
                case 'ease-out': optFunction.args = [0, 0, .58, 1]; break;
                case 'ease-in-out': optFunction.args = [.42, 0, .58, 1]; break;
                case 'cubic-bezier':
                    break;
                case 'linear':
                default:
                    optFunction.args = [0, 0, 1, 1];
                    break;
            }

            result.push(bezierEasing.apply(null, optFunction.args as [number, number, number, number]));
        }
    }

    return result;
}

export declare type AnimatableStyle =
    'translateX' | 'translateY' | 'translateZ' | 'opacity';

export interface IAnimation {
    styleName: AnimatableStyle;
    startY: number;
    endY: number;
    startValue: number;
    endValue: number;
    timingFunction: (num: number) => number;
}

export interface IComponent {
    element: HTMLElement;
    animations: IAnimation[];
    startY: number;
    endY: number;
}

let enabledComp = new Map<number, IComponent>();
let disabledComp = new Map<number, IComponent>();

function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const currentY = scrollY;// + window.innerHeight // / 2;

    disabledComp.forEach((component, id) => {
        const where = whereAmI(component, currentY);
        if (where == Y_BETWEEN) {
            disabledComp.delete(id);
            enabledComp.set(id, component);
            component.element.dataset.seqscrollPos = 'enabled';
        }
    });

    enabledComp.forEach((component, id) => {
        const where = whereAmI(component, currentY);
        if (where == Y_BETWEEN) {
            updateAnimation(component, currentY);
        } else if (where == Y_BEFORE) {
            enabledComp.delete(id);
            disabledComp.set(id, component);
            component.element.dataset.seqscrollPos = 'before';
        } else if (where == Y_AFTER) {
            enabledComp.delete(id);
            disabledComp.set(id, component);
            component.element.dataset.seqscrollPos = 'after';
        }
    });
}

function loadElements() {
    const elements = document.querySelectorAll('*[seqscroll-item]');
    elements.forEach((element) => {
        let anims: IAnimation[] = [];
        const htmlElement = element as HTMLElement;
        const compY = htmlElement.dataset.y?.split(':');
        if (!compY) throw new Error("SeqScroll Item must have right 'y' values.");
        let startY = Number(compY[0]);
        let endY = Number(compY.length > 1 ? compY[1] : compY[0]);
        htmlElement.querySelectorAll('meta[name="seqscroll:anim"]').forEach((anim) => {
            const animHtml = anim as HTMLMetaElement;

            const subAnimY = animHtml.dataset.y?.split(' ');
            const subAnimValue = animHtml.dataset.value?.split(' ');
            if (!subAnimY) throw new Error("SeqScroll Anim must have right 'y' values.");
            if (!subAnimValue) throw new Error("SeqScroll Anim must have right 'value' values.");
            if (subAnimY.length != subAnimValue.length) throw new Error("SeqScroll Anim must have right 'y', 'value' values.");

            //let subAnimTiming = animHtml.dataset.timing?.split(' ').map(s => (s as AnimatableTimingFunction));
            //if (!subAnimTiming) subAnimTiming = ['linear'];

            let subAnimTiming = loadTimingFunctions(animHtml.dataset.timing ?? '');
            console.log('SubAnimTiming: ', subAnimTiming);

            for (let i = 0; i < subAnimY.length; i++) {
                const animY = subAnimY[i].split(':');
                const animValue = subAnimValue[i].split(':');
                if (!animY) throw new Error("SeqScroll Anim must have right 'y' values.");
                if (!animValue) throw new Error("SeqScroll Anim must have right 'value' values.");

                const animTiming = subAnimTiming[i] ?? subAnimTiming[0];

                anims.push({
                    styleName: animHtml?.content as AnimatableStyle,
                    startY: animY[0].length > 0 ? startY + Number(animY[0]) : startY,
                    endY: animY[1].length > 0 ? startY + Number(animY[1]) : endY,
                    startValue: Number(animValue[0]),
                    endValue: Number(animValue[1]),
                    timingFunction: animTiming,
                });
            }
        });
        /*htmlElement.querySelectorAll('meta[name="seqscroll:fade"]').forEach((fade) => {
            const fadeHtml = fade as HTMLElement;
            const fadeDuration = fadeHtml.dataset.seqscrollFade?.split(':');
            const fadeIn = Number(fadeDuration?.at(0));
            const fadeOut = fadeDuration!.length > 1 ? Number(fadeDuration?.at(1)) : Number(fadeDuration?.at(0));
            const timing = fadeHtml.dataset.seqscrollTiming as AnimatableTimingFunction;
            anims.push({
                styleName: 'opacity',
                startY: startY,
                endY: startY + fadeIn,
                startValue: 0,
                endValue: 1,
                timingFunction: loadTimingFunction(timing),
            });
            anims.push({
                styleName: 'opacity',
                startY: endY - fadeOut,
                endY: endY,
                startValue: 1,
                endValue: 0,
                timingFunction: loadTimingFunction(timing),
            });
        });*/
        htmlElement.style.transform = 'translateX(0) translateY(0) translateZ(0)';
        htmlElement.dataset.seqscrollPos = 'before';
        disabledComp.set(disabledComp.size, {
            element: htmlElement,
            animations: anims,
            startY: startY,
            endY: endY,
        });

    });

    console.log('DisabledComp: ', disabledComp);

    onScroll();
}

loadElements();
window.addEventListener('scroll', onScroll);

function mixTranslate(element: HTMLElement, axis: string, value: number) {
    const transforms = element.style.transform.split(' ');
    const c = axis == 'translateX' ? 0 : axis == 'translateX' ? 1 : 2;
    transforms[c] = `${axis}(${value}px)`;
    element.style.transform = transforms.join(' ');
}

function applyStyle(element: HTMLElement, styleName: AnimatableStyle, value: number) {
    if (styleName == 'translateX' || styleName == 'translateY' || styleName == 'translateZ') {
        mixTranslate(element, styleName.toString(), value);
    } else {
        element.style.setProperty(styleName, value.toString());
    }
}

function calcRate(currentY: number, startY: number, endY: number) {
    return (currentY - startY) / (endY - startY);
}

function whereAmI(component: IComponent, currentY: number): number {
    if (component.startY > currentY) {
        return Y_BEFORE;
    } else if (component.endY < currentY) {
        return Y_AFTER;
    } else {
        return Y_BETWEEN;
    }
}

function updateAnimation(component: IComponent, currentY: number) {
    component.animations.forEach((anim) => {
        if (anim.startY <= currentY && anim.endY >= currentY) {
            console.log('ANIM: ', anim);
            const rate = calcRate(currentY, anim.startY, anim.endY);
            applyStyle(component.element, anim.styleName, anim.startValue + (anim.endValue - anim.startValue) * anim.timingFunction(rate));
        }
    });
}