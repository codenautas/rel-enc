"use strict";
exports.__esModule = true;
var rel_enc_1 = require("./rel-enc");
var operativos_1 = require("operativos");
var AppRelEnc = rel_enc_1.emergeAppRelEnc(operativos_1.emergeAppOperativos(operativos_1.AppBackend));
new AppRelEnc().start();
