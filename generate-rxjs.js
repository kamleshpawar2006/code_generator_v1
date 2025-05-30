const fs = require('fs');
const path = require('path');

function writeFile(content, fileName, entityFolder) {
    const outputDir = path.join(__dirname, 'generated-rxjs', entityFolder);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, content.trim());
    console.log(`✅ Generated: ${filePath}`);
}

function generateRxJsStore(entityName) {
    const fileName = `${entityName.toLowerCase()}.store.ts`;
    const entityLower = entityName.toLowerCase();
    const modelImportPath = `../${entityName}.model`;
    const serviceImportPath = `../${entityName.toLowerCase()}.service`;

    const content = `
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { ${entityName} } from '${modelImportPath}';
import { ${entityName}Service } from '${serviceImportPath}';

interface ${entityName}State {
    ${entityLower}: ${entityName}[];
    loading: boolean;
    error: any;
}

@Injectable({
    providedIn: 'root',
})
export class ${entityName}Store {
    private readonly _state = new BehaviorSubject<${entityName}State>({
        ${entityLower}: [],
        loading: false,
        error: null,
    });

    readonly state$: Observable<${entityName}State> = this._state.asObservable();

    readonly vm$ = this.state$;

    constructor(private ${entityLower}Service: ${entityName}Service) {}

    load${entityName}(): void {
        this.patchState({ loading: true, error: null });

        this.${entityLower}Service.get${entityName}().pipe(
            finalize(() => this.patchState({ loading: false })),
            catchError((error) => {
                this.patchState({ error });
                throw error;
            })
        ).subscribe(${entityLower} => {
            this.patchState({ ${entityLower} });
        });
    }

    private patchState(partialState: Partial<${entityName}State>) {
        this._state.next({
            ...this._state.getValue(),
            ...partialState,
        });
    }
}
    `;

    writeFile(content, fileName, entityLower);
}

// === CLI Entry Point ===

const entityName = process.argv[2];
if (!entityName) {
    console.error("❌ Please provide an entity name as argument.");
    console.error("Example: node generate-rxjs.js Product");
    process.exit(1);
}

generateRxJsStore(entityName);