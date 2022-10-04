export interface OptLine {
    options: Array<OptElement>
}

export declare type OptType = 'function' | 'number' | 'range';
export declare type OptNumberUnit = 'px' | '%';

export interface OptElement {
    type: OptType;
}

export interface OptNumber extends OptElement {
    value: number;
    unit: OptNumberUnit;
}

export interface OptFunction extends OptElement {
    name: string;
    args: Array<any>;
}

export default class OptLineParser {
    private input: string;
    private position: number;

    constructor(input: string, position: number = 0) {
        this.input = input;
        this.position = position;
    }

    public parseLine(): OptLine {
        this.consumeWhitespace();

        let opts: Array<OptElement> = [];

        while(!this.isEndOfInput()) {
            if(':+-.0123456789'.indexOf(this.getCharacter()) === -1) {
                opts.push(this.parseOptFunction());
            }
            this.consumeWhitespace();
        }

        return {
            options: opts
        };
    }

    public parseOptFunction(): OptFunction {
        const name = this.consumeWhile((char: string) => char !== '(');

        if(!this.isEndOfInput() && this.getCharacter() == '(') this.consumeCharacter();
        
        let args = [];
        if(!this.isEndOfInput()) {
            args = this.parseArgs(); 
        }

        return { type: 'function', name, args };
    }

    private parseArgs(): Array<any> {
        let args = [];
        
        this.consumeWhitespace();
        
        while(this.getCharacter() !== ')') {
            this.consumeWhitespace();
            let char: string = this.getCharacter();
            if('-+.0123456789'.indexOf(char) !== -1) {
                args.push(this.parseNumber());
            } else if (char === ',') {
                this.consumeCharacter();
            } else {
                args.push(this.consumeWhile((char: string) => '),'.indexOf(char) !== -1));
            }
        }

        this.consumeCharacter(); // ) 패스

        return args;
    }

    private parseNumber(): number {
        return Number(
            this.consumeWhile((char: string) => '-+.0123456789'.indexOf(char) !== -1)
        );
    }

    private getCharacter(): string {
        return this.input[this.position];
    }

    private isEndOfInput(): boolean {
        return this.position >= this.input.length;
    }

    private makeInputIterator = function* (input: string, start: number = 0): Generator {
        for(let i = start; i < input.length; i++)
            yield [i, input[i]];
    }

    private consumeCharacter(): string {
        const inputIterator = this.makeInputIterator(this.input, this.position);
        const [currentPos, currentChar] = inputIterator.next().value;
        this.position ++;
        return currentChar;
    }

    private consumeWhile(test: Function): string {
        let result = '';
        while(!this.isEndOfInput() && test(this.getCharacter())) {
            result += this.consumeCharacter();
        }
        return result;
    }

    private consumeWhitespace() {
        this.consumeWhile((char: string) => char === ' ');
    }
}