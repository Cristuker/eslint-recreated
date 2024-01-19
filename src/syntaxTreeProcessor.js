export default class SyntaxTreeProcessor {
    #filePath;
    #erros = new Map();
    #variables = new Map();
    #messages = {
        singleQuote: () => 'use single quote instead of double quotes',
        useConst: (variableKind) => `use "const" instead of ${variableKind}`,
        useLet: (variableKind) => `use "let" instead of ${variableKind}`
    }
    #stages = {
        declaration: 'declaration',
        expressionDeclaration: 'expressionDeclaration'
    }
    #variableKinds = {
        const: 'const',
        let: 'let',
        var: 'var'
    }
    constructor(filePath) {
        this.#filePath = filePath;
    }
    #storeError(message, { line, column }) {
        const location = `${this.#filePath}:${line}:${column + 1}`;
        this.#erros.set(location, { message, location });
    }
    #handleLiteral(node) {
        const itsValidRawValue = node.raw && typeof node.value === 'string';
        if (!itsValidRawValue) return;
        if (!node.raw.includes(`"`)) return;
        node.raw = node.raw.replace(/"/g, "'");
        this.#storeError(this.#messages.singleQuote(), node.loc.start);
    }
    #handleVariableDeclaration(node) {
        const originalKind = node.kind;
        for (const declaration of node.declarations) {
            this.#variables.set(declaration.id.name, {
                originalKind,
                stage: this.#stages.declaration,
                node
            });
        }
    }
    #handleExpressionStatement(nodeDeclaration) {
        const { expression } = nodeDeclaration;
        if (!expression.left) return;

        const varName = (expression.left.object || expression.left).name;
        if (!this.#variables.has(varName)) return;

        const variable = this.#variables.get(varName);
        const { node, originalKind, stage } = variable;
        // Muda a variavel para const
        if (expression.left.type === 'MemberExpression' && stage === this.#stages.declaration) {
            if (originalKind === this.#variableKinds.const) return;
            this.#storeError(this.#messages.useConst(originalKind), node.loc.start);
            node.kind = this.#variableKinds.const;
            this.#variables.set(varName, {
                ...variable,
                stage: this.#stages.expressionDeclaration,
                node
            });
            return;
        }
        // Mantém a variavel do jeito que está
        if ([node.kind, originalKind].includes(this.#variableKinds.let)) {
            this.#variables.set(varName, {
                ...variable,
                stage: this.#stages.expressionDeclaration,
                node,
            });

            return;
        }
        // Muda para var/const
        this.#storeError(
            this.#messages.useLet(originalKind),
            node.loc.start
        );
        node.kind = this.#variableKinds.let;
        this.#variables.set(varName, {
            ...variable,
            stage: this.#stages.expressionDeclaration,
            node,
        });
        return;

    }
    #traverse(nodeDeclaration) {
        const hooks = {
            Literal: (nodeDeclaration) => this.#handleLiteral(nodeDeclaration),
            VariableDeclaration: (nodeDeclaration) => this.#handleVariableDeclaration(nodeDeclaration),
            ExpressionStatement: (nodeDeclaration) => this.#handleExpressionStatement(nodeDeclaration)
        }
        hooks[nodeDeclaration?.type]?.(nodeDeclaration);
        for (const key in nodeDeclaration) {
            if (typeof nodeDeclaration[key] !== 'object') continue;
            this.#traverse(nodeDeclaration[key]);
        }
    }
    #checkDeclarationsThatNeverChanged() {
        [...this.#variables.values()]
            .filter(({ stage, node }) =>
                stage === this.#stages.declaration && node.kind !== this.#variableKinds.const
            )
            .forEach(({ node }) => {
                this.#storeError(
                    this.#messages.useConst(node.kind),
                    node.loc.start
                )
                node.kind = this.#variableKinds.const
            })

    }
    process(ast) {
        this.#traverse(ast);
        this.#checkDeclarationsThatNeverChanged()

        return [...this.#erros.values()];
    }
}