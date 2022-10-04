interface MultipleOptions {
    options: Array<SingleOption>;
}

declare type OptionType = 'range' | 'number' | 'exec';

interface SingleOption {
    type: OptionType;
    value: string | number | [number | undefined, number | undefined];
}

class OptionsParser {
    private input: string;
    private position: number;

    constructor(input: string, position: number) {
        this.input = input;
        this.position = position;
    }

    // Utils
    
    private getCharacter(): string {
        return this.input[this.position];
    }

    private startsWith(str: string): boolean {
        let cur = this.position;
        return Array.from(str).every(char => this.input[cur++] === char);
    }

    private isEndOfInput(): boolean {
        return this.position >= this.input.length;
    }

    private makeInputIterator = function* (input: string, start: number = 0): Generator {
        for(let i = start; i < input.length; i++) {
            yield [i, input[i]];
        }
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

    public parse(): MultipleOptions {
        const options = this.parseOptions();
        return {
            options
        };
    }

    private parseOptions(): Array<SingleOption> {
        let options = [];

        while(true) {
            this.consumeWhitespace();
            if(this.isEndOfInput()) break;
            options.push(this.parseOption());
        }
    }

    private parseOption(): SingleOption {
        const char = this.getCharacter();
        if(':-+0123456789'.indexOf(char) !== -1) {
            return this.parseNumberOrRangeOption();
        } else {
            return this.parseString();
        }
    }

    private parseNumberOrRangeOption(): SingleOption {
        let result: number[] = [];
        
        result.push(Number(this.consumeWhile((char: string) => {
            return '-+0123456789'.indexOf(char) !== -1
        })));

        if(this.getCharacter() === ':') {
            this.consumeCharacter();

            result.push(Number(this.consumeWhile((char: string) => {
                return '-+0123456789'.indexOf(char) !== -1
            })));

            return {
                type: 'range',
                value: [result[0], result[1]],
            }
        } else {
            return {
                type: 'number',
                value: result[0]
            }
        }
    }

    private parseString(): SingleOption {
        
    }

}

export default optionsParser;