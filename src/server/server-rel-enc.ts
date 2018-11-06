"use strict";

import {emergeAppRelEnc} from "./rel-enc"
import {emergeAppOperativos, AppBackend} from "operativos"

var AppRelEnc = emergeAppRelEnc(emergeAppOperativos(AppBackend));
new AppRelEnc().start();