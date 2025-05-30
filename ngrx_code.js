const fs = require('fs');
const path = require('path');

// Utility function to write files
function writeFile(content, fileName, entityFolder) {
    const outputDir = path.join(__dirname, 'generated', entityFolder);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, content.trim());
    console.log(`✅ Generated: ${filePath}`);
}

// === ACTION GENERATOR ===
function generateNgRxActions(entityName) {
    const fileName = `${entityName.toLowerCase()}.actions.ts`;
    const modelImportPath = `../${entityName}.model`;

    const content = `
import { createAction, props } from '@ngrx/store';
import { ${entityName} } from '${modelImportPath}';

export const load${entityName} = createAction("[${entityName}] Load ${entityName}");
export const load${entityName}Success = createAction("[${entityName}] Load ${entityName} Success", props<{ ${entityName.toLowerCase()}: ${entityName}[] }>());
export const load${entityName}Error = createAction("[${entityName}] Load ${entityName} Error", props<{ error: any }>());
    `;

    writeFile(content, fileName, entityName.toLowerCase());
}

// === REDUCER GENERATOR ===
function generateNgRxReducer(entityName) {
    const fileName = `${entityName.toLowerCase()}.reducer.ts`;
    const modelImportPath = `../${entityName}.model`;
    const actionsImportPath = `./${entityName.toLowerCase()}.actions`;

    const entityLower = entityName.toLowerCase();

    const content = `
import { createReducer, on } from '@ngrx/store';
import { ${entityName} } from '${modelImportPath}';
import * as ${entityName}Actions from '${actionsImportPath}';

export interface ${entityName}State {
    ${entityLower}: ${entityName}[];
    loading: boolean;
    error: any;
}

export const initialState: ${entityName}State = {
    ${entityLower}: [],
    loading: false,
    error: null
};

export const ${entityLower}Reducer = createReducer(
    initialState,
    on(${entityName}Actions.load${entityName}, state => ({
        ...state,
        loading: true
    })),
    on(${entityName}Actions.load${entityName}Success, (state, { ${entityLower} }) => ({
        ...state,
        ${entityLower},
        loading: false
    })),
    on(${entityName}Actions.load${entityName}Error, (state, { error }) => ({
        ...state,
        error,
        loading: false
    }))
);
    `;

    writeFile(content, fileName, entityName.toLowerCase());
}

// === EFFECTS GENERATOR ===
function generateNgRxEffects(entityName) {
    const fileName = `${entityName.toLowerCase()}.effects.ts`;
    const modelImportPath = `../${entityName}.model`;
    const actionsImportPath = `./${entityName.toLowerCase()}.actions`;

    const entityLower = entityName.toLowerCase();
    const entityService = `${entityName}Service`;

    const content = `
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ${entityService} } from '../${entityService.toLowerCase()}';
import * as ${entityName}Actions from '${actionsImportPath}';

@Injectable()
export class ${entityName}Effects {
    private actions$ = inject(Actions);
    private ${entityLower}Service = inject(${entityService});

    load${entityName}$ = createEffect(() =>
        this.actions$.pipe(
            ofType(${entityName}Actions.load${entityName}),
            switchMap(() =>
                this.${entityLower}Service.get${entityName}().pipe(
                    map(${entityLower} => ${entityName}Actions.load${entityName}Success({ ${entityLower} })),
                    catchError(error => of(${entityName}Actions.load${entityName}Error({ error })))
                )
            )
        )
    );
}
    `;

    writeFile(content, fileName, entityName.toLowerCase());
}

// === SELECTORS GENERATOR ===
function generateNgRxSelectors(entityName) {
    const fileName = `${entityName.toLowerCase()}.selectors.ts`;
    const reducerImportPath = `./${entityName.toLowerCase()}.reducer`;

    const entityLower = entityName.toLowerCase();

    const content = `
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ${entityName}State } from '${reducerImportPath}';

export const select${entityName}State = createFeatureSelector<${entityName}State>('${entityLower}');

export const select${entityName}Data = createSelector(
    select${entityName}State,
    (state: ${entityName}State) => state.${entityLower}
);

export const select${entityName}Loading = createSelector(
    select${entityName}State,
    (state: ${entityName}State) => state.loading
);

export const select${entityName}Error = createSelector(
    select${entityName}State,
    (state: ${entityName}State) => state.error
);
    `;

    writeFile(content, fileName, entityName.toLowerCase());
}

// === FACADE GENERATOR ===
function generateNgRxFacade(entityName) {
    const fileName = `${entityName.toLowerCase()}.facade.ts`;

    const actionsImportPath = `./${entityName.toLowerCase()}.actions`;
    const selectorsImportPath = `./${entityName.toLowerCase()}.selectors`;

    const entityLower = entityName.toLowerCase();

    const content = `
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as ${entityName}Actions from '${actionsImportPath}';
import * as ${entityName}Selectors from '${selectorsImportPath}';

@Injectable({ providedIn: 'root' })
export class ${entityName}Facade {
    private store = inject(Store);

    readonly ${entityLower}$ = this.store.select(${entityName}Selectors.select${entityName}Data);
    readonly loading$ = this.store.select(${entityName}Selectors.select${entityName}Loading);
    readonly error$ = this.store.select(${entityName}Selectors.select${entityName}Error);

    load${entityName}() {
        this.store.dispatch(${entityName}Actions.load${entityName}());
    }
}
    `;

    writeFile(content, fileName, entityName.toLowerCase());
}

// === FACADE OBJECT GENERATOR (NEW) ===
function generateNgRxFacadeObject(entityName) {
    const fileName = `${entityName.toLowerCase()}.facade-object.ts`;

    const actionsImportPath = `./${entityName.toLowerCase()}.actions`;
    const selectorsImportPath = `./${entityName.toLowerCase()}.selectors`;

    const entityLower = entityName.toLowerCase();

    const content = `
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import * as ${entityName}Actions from '${actionsImportPath}';
import * as ${entityName}Selectors from '${selectorsImportPath}';

@Injectable({ providedIn: 'root' })
export class ${entityName}FacadeObject {
    private store = inject(Store);

    readonly state$ = this.store.select(${entityName}Selectors.select${entityName}State);

    readonly vm$ = this.state$.pipe(
        map(state => ({
            data: state.${entityLower},
            loading: state.loading,
            error: state.error
        }))
    );

    load${entityName}() {
        this.store.dispatch(${entityName}Actions.load${entityName}());
    }
}
    `;

    writeFile(content, fileName, entityName.toLowerCase());
}

// === MASTER DRIVER ===
function generateAll(entityName) {
    generateNgRxActions(entityName);
    generateNgRxReducer(entityName);
    generateNgRxEffects(entityName);
    generateNgRxSelectors(entityName);
    generateNgRxFacade(entityName);
    generateNgRxFacadeObject(entityName);
}

// === COMMAND LINE HANDLER ===
const entityName = process.argv[2];
if (!entityName) {
    console.error("❌ Please provide an entity name as argument.");
    console.error("Example: node generate-ngrx.js Journal");
    process.exit(1);
}

generateAll(entityName);