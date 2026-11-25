import * as assert from 'assert';
import 'mocha';

import { AppRelEnc, emergeAppRelEnc } from '../server/rel-enc';

// Los tests que necesitan base de datos o el servidor levantado (addLoggedServices) no están acá.

describe("rel-enc", function () {
    it("exporta la función que emerge la aplicación y la aplicación armada sobre operativos", function () {
        assert.strictEqual(typeof emergeAppRelEnc, 'function');
        assert.strictEqual(AppRelEnc.name, 'AppRelEnc');
    });
    it("agrega al cliente el validador de filas, la estructura del formulario y sus estilos", function () {
        var incluidos = new AppRelEnc().clientIncludes(null, { hideBEPlusInclusions: true });
        var deRelEnc = incluidos.filter(m => m.module == 'rel-enc' || m.module == 'row-validator').map(m => `${m.type}:${m.module}/${m.file}`);
        assert.deepStrictEqual(deRelEnc, [
            'js:row-validator/row-validator.js',
            'js:rel-enc/form-structure.js',
            'css:rel-enc/formularios.css',
            'css:rel-enc/estados.css',
            'css:rel-enc/my-things2.css',
        ]);
    });
});
