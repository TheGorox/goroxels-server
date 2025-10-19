/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./lib/converter/bin/converter.js":
/*!****************************************!*\
  !*** ./lib/converter/bin/converter.js ***!
  \****************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   converter: () => (/* binding */ converter)
/* harmony export */ });
/* module decorator */ module = __webpack_require__.hmd(module);

var converter = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  
  return (
function(converter) {
  converter = converter || {};

var Module=typeof converter!="undefined"?converter:{};var readyPromiseResolve,readyPromiseReject;Module["ready"]=new Promise(function(resolve,reject){readyPromiseResolve=resolve;readyPromiseReject=reject});var moduleOverrides=Object.assign({},Module);var arguments_=[];var thisProgram="./this.program";var quit_=(status,toThrow)=>{throw toThrow};var ENVIRONMENT_IS_WEB=true;var ENVIRONMENT_IS_WORKER=false;var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}return scriptDirectory+path}var read_,readAsync,readBinary,setWindowTitle;if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WORKER){scriptDirectory=self.location.href}else if(typeof document!="undefined"&&document.currentScript){scriptDirectory=document.currentScript.src}if(_scriptDir){scriptDirectory=_scriptDir}if(scriptDirectory.indexOf("blob:")!==0){scriptDirectory=scriptDirectory.substr(0,scriptDirectory.replace(/[?#].*/,"").lastIndexOf("/")+1)}else{scriptDirectory=""}{read_=url=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(ENVIRONMENT_IS_WORKER){readBinary=url=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}}readAsync=(url,onload,onerror)=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=()=>{if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}onerror()};xhr.onerror=onerror;xhr.send(null)}}setWindowTitle=title=>document.title=title}else{}var out=Module["print"]||console.log.bind(console);var err=Module["printErr"]||console.warn.bind(console);Object.assign(Module,moduleOverrides);moduleOverrides=null;if(Module["arguments"])arguments_=Module["arguments"];if(Module["thisProgram"])thisProgram=Module["thisProgram"];if(Module["quit"])quit_=Module["quit"];var wasmBinary;if(Module["wasmBinary"])wasmBinary=Module["wasmBinary"];var noExitRuntime=Module["noExitRuntime"]||true;if(typeof WebAssembly!="object"){abort("no native wasm support detected")}var wasmMemory;var ABORT=false;var EXITSTATUS;var UTF8Decoder=typeof TextDecoder!="undefined"?new TextDecoder("utf8"):undefined;function UTF8ArrayToString(heapOrArray,idx,maxBytesToRead){var endIdx=idx+maxBytesToRead;var endPtr=idx;while(heapOrArray[endPtr]&&!(endPtr>=endIdx))++endPtr;if(endPtr-idx>16&&heapOrArray.buffer&&UTF8Decoder){return UTF8Decoder.decode(heapOrArray.subarray(idx,endPtr))}else{var str="";while(idx<endPtr){var u0=heapOrArray[idx++];if(!(u0&128)){str+=String.fromCharCode(u0);continue}var u1=heapOrArray[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}var u2=heapOrArray[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u0=(u0&7)<<18|u1<<12|u2<<6|heapOrArray[idx++]&63}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}return str}function UTF8ToString(ptr,maxBytesToRead){return ptr?UTF8ArrayToString(HEAPU8,ptr,maxBytesToRead):""}function stringToUTF8Array(str,heap,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023}if(u<=127){if(outIdx>=endIdx)break;heap[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;heap[outIdx++]=192|u>>6;heap[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;heap[outIdx++]=224|u>>12;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63}else{if(outIdx+3>=endIdx)break;heap[outIdx++]=240|u>>18;heap[outIdx++]=128|u>>12&63;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63}}heap[outIdx]=0;return outIdx-startIdx}function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127)++len;else if(u<=2047)len+=2;else if(u<=65535)len+=3;else len+=4}return len}var UTF16Decoder=typeof TextDecoder!="undefined"?new TextDecoder("utf-16le"):undefined;function UTF16ToString(ptr,maxBytesToRead){var endPtr=ptr;var idx=endPtr>>1;var maxIdx=idx+maxBytesToRead/2;while(!(idx>=maxIdx)&&HEAPU16[idx])++idx;endPtr=idx<<1;if(endPtr-ptr>32&&UTF16Decoder){return UTF16Decoder.decode(HEAPU8.subarray(ptr,endPtr))}else{var str="";for(var i=0;!(i>=maxBytesToRead/2);++i){var codeUnit=HEAP16[ptr+i*2>>1];if(codeUnit==0)break;str+=String.fromCharCode(codeUnit)}return str}}function stringToUTF16(str,outPtr,maxBytesToWrite){if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647}if(maxBytesToWrite<2)return 0;maxBytesToWrite-=2;var startPtr=outPtr;var numCharsToWrite=maxBytesToWrite<str.length*2?maxBytesToWrite/2:str.length;for(var i=0;i<numCharsToWrite;++i){var codeUnit=str.charCodeAt(i);HEAP16[outPtr>>1]=codeUnit;outPtr+=2}HEAP16[outPtr>>1]=0;return outPtr-startPtr}function lengthBytesUTF16(str){return str.length*2}function UTF32ToString(ptr,maxBytesToRead){var i=0;var str="";while(!(i>=maxBytesToRead/4)){var utf32=HEAP32[ptr+i*4>>2];if(utf32==0)break;++i;if(utf32>=65536){var ch=utf32-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}else{str+=String.fromCharCode(utf32)}}return str}function stringToUTF32(str,outPtr,maxBytesToWrite){if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647}if(maxBytesToWrite<4)return 0;var startPtr=outPtr;var endPtr=startPtr+maxBytesToWrite-4;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343){var trailSurrogate=str.charCodeAt(++i);codeUnit=65536+((codeUnit&1023)<<10)|trailSurrogate&1023}HEAP32[outPtr>>2]=codeUnit;outPtr+=4;if(outPtr+4>endPtr)break}HEAP32[outPtr>>2]=0;return outPtr-startPtr}function lengthBytesUTF32(str){var len=0;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343)++i;len+=4}return len}function allocateUTF8OnStack(str){var size=lengthBytesUTF8(str)+1;var ret=stackAlloc(size);stringToUTF8Array(str,HEAP8,ret,size);return ret}var buffer,HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateGlobalBufferAndViews(buf){buffer=buf;Module["HEAP8"]=HEAP8=new Int8Array(buf);Module["HEAP16"]=HEAP16=new Int16Array(buf);Module["HEAP32"]=HEAP32=new Int32Array(buf);Module["HEAPU8"]=HEAPU8=new Uint8Array(buf);Module["HEAPU16"]=HEAPU16=new Uint16Array(buf);Module["HEAPU32"]=HEAPU32=new Uint32Array(buf);Module["HEAPF32"]=HEAPF32=new Float32Array(buf);Module["HEAPF64"]=HEAPF64=new Float64Array(buf)}var INITIAL_MEMORY=Module["INITIAL_MEMORY"]||16777216;var wasmTable;var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;function keepRuntimeAlive(){return noExitRuntime}function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function initRuntime(){runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}function addOnInit(cb){__ATINIT__.unshift(cb)}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}function abort(what){{if(Module["onAbort"]){Module["onAbort"](what)}}what="Aborted("+what+")";err(what);ABORT=true;EXITSTATUS=1;what+=". Build with -sASSERTIONS for more info.";var e=new WebAssembly.RuntimeError(what);readyPromiseReject(e);throw e}var dataURIPrefix="data:application/octet-stream;base64,";function isDataURI(filename){return filename.startsWith(dataURIPrefix)}var wasmBinaryFile;wasmBinaryFile="converter.wasm";if(!isDataURI(wasmBinaryFile)){wasmBinaryFile=locateFile(wasmBinaryFile)}function getBinary(file){try{if(file==wasmBinaryFile&&wasmBinary){return new Uint8Array(wasmBinary)}if(readBinary){return readBinary(file)}else{throw"both async and sync fetching of the wasm failed"}}catch(err){abort(err)}}function getBinaryPromise(){if(!wasmBinary&&(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER)){if(typeof fetch=="function"){return fetch(wasmBinaryFile,{credentials:"same-origin"}).then(function(response){if(!response["ok"]){throw"failed to load wasm binary file at '"+wasmBinaryFile+"'"}return response["arrayBuffer"]()}).catch(function(){return getBinary(wasmBinaryFile)})}}return Promise.resolve().then(function(){return getBinary(wasmBinaryFile)})}function createWasm(){var info={"a":asmLibraryArg};function receiveInstance(instance,module){var exports=instance.exports;Module["asm"]=exports;wasmMemory=Module["asm"]["y"];updateGlobalBufferAndViews(wasmMemory.buffer);wasmTable=Module["asm"]["A"];addOnInit(Module["asm"]["z"]);removeRunDependency("wasm-instantiate")}addRunDependency("wasm-instantiate");function receiveInstantiationResult(result){receiveInstance(result["instance"])}function instantiateArrayBuffer(receiver){return getBinaryPromise().then(function(binary){return WebAssembly.instantiate(binary,info)}).then(function(instance){return instance}).then(receiver,function(reason){err("failed to asynchronously prepare wasm: "+reason);abort(reason)})}function instantiateAsync(){if(!wasmBinary&&typeof WebAssembly.instantiateStreaming=="function"&&!isDataURI(wasmBinaryFile)&&typeof fetch=="function"){return fetch(wasmBinaryFile,{credentials:"same-origin"}).then(function(response){var result=WebAssembly.instantiateStreaming(response,info);return result.then(receiveInstantiationResult,function(reason){err("wasm streaming compile failed: "+reason);err("falling back to ArrayBuffer instantiation");return instantiateArrayBuffer(receiveInstantiationResult)})})}else{return instantiateArrayBuffer(receiveInstantiationResult)}}if(Module["instantiateWasm"]){try{var exports=Module["instantiateWasm"](info,receiveInstance);return exports}catch(e){err("Module.instantiateWasm callback failed with error: "+e);return false}}instantiateAsync().catch(readyPromiseReject);return{}}function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback(Module);continue}var func=callback.func;if(typeof func=="number"){if(callback.arg===undefined){getWasmTableEntry(func)()}else{getWasmTableEntry(func)(callback.arg)}}else{func(callback.arg===undefined?null:callback.arg)}}}var wasmTableMirror=[];function getWasmTableEntry(funcPtr){var func=wasmTableMirror[funcPtr];if(!func){if(funcPtr>=wasmTableMirror.length)wasmTableMirror.length=funcPtr+1;wasmTableMirror[funcPtr]=func=wasmTable.get(funcPtr)}return func}function handleException(e){if(e instanceof ExitStatus||e=="unwind"){return EXITSTATUS}quit_(1,e)}function ___cxa_allocate_exception(size){return _malloc(size+24)+24}function ExceptionInfo(excPtr){this.excPtr=excPtr;this.ptr=excPtr-24;this.set_type=function(type){HEAPU32[this.ptr+4>>2]=type};this.get_type=function(){return HEAPU32[this.ptr+4>>2]};this.set_destructor=function(destructor){HEAPU32[this.ptr+8>>2]=destructor};this.get_destructor=function(){return HEAPU32[this.ptr+8>>2]};this.set_refcount=function(refcount){HEAP32[this.ptr>>2]=refcount};this.set_caught=function(caught){caught=caught?1:0;HEAP8[this.ptr+12>>0]=caught};this.get_caught=function(){return HEAP8[this.ptr+12>>0]!=0};this.set_rethrown=function(rethrown){rethrown=rethrown?1:0;HEAP8[this.ptr+13>>0]=rethrown};this.get_rethrown=function(){return HEAP8[this.ptr+13>>0]!=0};this.init=function(type,destructor){this.set_adjusted_ptr(0);this.set_type(type);this.set_destructor(destructor);this.set_refcount(0);this.set_caught(false);this.set_rethrown(false)};this.add_ref=function(){var value=HEAP32[this.ptr>>2];HEAP32[this.ptr>>2]=value+1};this.release_ref=function(){var prev=HEAP32[this.ptr>>2];HEAP32[this.ptr>>2]=prev-1;return prev===1};this.set_adjusted_ptr=function(adjustedPtr){HEAPU32[this.ptr+16>>2]=adjustedPtr};this.get_adjusted_ptr=function(){return HEAPU32[this.ptr+16>>2]};this.get_exception_ptr=function(){var isPointer=___cxa_is_pointer_type(this.get_type());if(isPointer){return HEAPU32[this.excPtr>>2]}var adjusted=this.get_adjusted_ptr();if(adjusted!==0)return adjusted;return this.excPtr}}var exceptionLast=0;var uncaughtExceptionCount=0;function ___cxa_throw(ptr,type,destructor){var info=new ExceptionInfo(ptr);info.init(type,destructor);exceptionLast=ptr;uncaughtExceptionCount++;throw ptr}function __embind_register_bigint(primitiveType,name,size,minRange,maxRange){}function getShiftFromSize(size){switch(size){case 1:return 0;case 2:return 1;case 4:return 2;case 8:return 3;default:throw new TypeError("Unknown type size: "+size)}}function embind_init_charCodes(){var codes=new Array(256);for(var i=0;i<256;++i){codes[i]=String.fromCharCode(i)}embind_charCodes=codes}var embind_charCodes=undefined;function readLatin1String(ptr){var ret="";var c=ptr;while(HEAPU8[c]){ret+=embind_charCodes[HEAPU8[c++]]}return ret}var awaitingDependencies={};var registeredTypes={};var typeDependencies={};var char_0=48;var char_9=57;function makeLegalFunctionName(name){if(undefined===name){return"_unknown"}name=name.replace(/[^a-zA-Z0-9_]/g,"$");var f=name.charCodeAt(0);if(f>=char_0&&f<=char_9){return"_"+name}return name}function createNamedFunction(name,body){name=makeLegalFunctionName(name);return new Function("body","return function "+name+"() {\n"+'    "use strict";'+"    return body.apply(this, arguments);\n"+"};\n")(body)}function extendError(baseErrorType,errorName){var errorClass=createNamedFunction(errorName,function(message){this.name=errorName;this.message=message;var stack=new Error(message).stack;if(stack!==undefined){this.stack=this.toString()+"\n"+stack.replace(/^Error(:[^\n]*)?\n/,"")}});errorClass.prototype=Object.create(baseErrorType.prototype);errorClass.prototype.constructor=errorClass;errorClass.prototype.toString=function(){if(this.message===undefined){return this.name}else{return this.name+": "+this.message}};return errorClass}var BindingError=undefined;function throwBindingError(message){throw new BindingError(message)}var InternalError=undefined;function throwInternalError(message){throw new InternalError(message)}function whenDependentTypesAreResolved(myTypes,dependentTypes,getTypeConverters){myTypes.forEach(function(type){typeDependencies[type]=dependentTypes});function onComplete(typeConverters){var myTypeConverters=getTypeConverters(typeConverters);if(myTypeConverters.length!==myTypes.length){throwInternalError("Mismatched type converter count")}for(var i=0;i<myTypes.length;++i){registerType(myTypes[i],myTypeConverters[i])}}var typeConverters=new Array(dependentTypes.length);var unregisteredTypes=[];var registered=0;dependentTypes.forEach((dt,i)=>{if(registeredTypes.hasOwnProperty(dt)){typeConverters[i]=registeredTypes[dt]}else{unregisteredTypes.push(dt);if(!awaitingDependencies.hasOwnProperty(dt)){awaitingDependencies[dt]=[]}awaitingDependencies[dt].push(()=>{typeConverters[i]=registeredTypes[dt];++registered;if(registered===unregisteredTypes.length){onComplete(typeConverters)}})}});if(0===unregisteredTypes.length){onComplete(typeConverters)}}function registerType(rawType,registeredInstance,options={}){if(!("argPackAdvance"in registeredInstance)){throw new TypeError("registerType registeredInstance requires argPackAdvance")}var name=registeredInstance.name;if(!rawType){throwBindingError('type "'+name+'" must have a positive integer typeid pointer')}if(registeredTypes.hasOwnProperty(rawType)){if(options.ignoreDuplicateRegistrations){return}else{throwBindingError("Cannot register type '"+name+"' twice")}}registeredTypes[rawType]=registeredInstance;delete typeDependencies[rawType];if(awaitingDependencies.hasOwnProperty(rawType)){var callbacks=awaitingDependencies[rawType];delete awaitingDependencies[rawType];callbacks.forEach(cb=>cb())}}function __embind_register_bool(rawType,name,size,trueValue,falseValue){var shift=getShiftFromSize(size);name=readLatin1String(name);registerType(rawType,{name:name,"fromWireType":function(wt){return!!wt},"toWireType":function(destructors,o){return o?trueValue:falseValue},"argPackAdvance":8,"readValueFromPointer":function(pointer){var heap;if(size===1){heap=HEAP8}else if(size===2){heap=HEAP16}else if(size===4){heap=HEAP32}else{throw new TypeError("Unknown boolean type size: "+name)}return this["fromWireType"](heap[pointer>>shift])},destructorFunction:null})}var emval_free_list=[];var emval_handle_array=[{},{value:undefined},{value:null},{value:true},{value:false}];function __emval_decref(handle){if(handle>4&&0===--emval_handle_array[handle].refcount){emval_handle_array[handle]=undefined;emval_free_list.push(handle)}}function count_emval_handles(){var count=0;for(var i=5;i<emval_handle_array.length;++i){if(emval_handle_array[i]!==undefined){++count}}return count}function get_first_emval(){for(var i=5;i<emval_handle_array.length;++i){if(emval_handle_array[i]!==undefined){return emval_handle_array[i]}}return null}function init_emval(){Module["count_emval_handles"]=count_emval_handles;Module["get_first_emval"]=get_first_emval}var Emval={toValue:handle=>{if(!handle){throwBindingError("Cannot use deleted val. handle = "+handle)}return emval_handle_array[handle].value},toHandle:value=>{switch(value){case undefined:return 1;case null:return 2;case true:return 3;case false:return 4;default:{var handle=emval_free_list.length?emval_free_list.pop():emval_handle_array.length;emval_handle_array[handle]={refcount:1,value:value};return handle}}}};function simpleReadValueFromPointer(pointer){return this["fromWireType"](HEAPU32[pointer>>2])}function __embind_register_emval(rawType,name){name=readLatin1String(name);registerType(rawType,{name:name,"fromWireType":function(handle){var rv=Emval.toValue(handle);__emval_decref(handle);return rv},"toWireType":function(destructors,value){return Emval.toHandle(value)},"argPackAdvance":8,"readValueFromPointer":simpleReadValueFromPointer,destructorFunction:null})}function floatReadValueFromPointer(name,shift){switch(shift){case 2:return function(pointer){return this["fromWireType"](HEAPF32[pointer>>2])};case 3:return function(pointer){return this["fromWireType"](HEAPF64[pointer>>3])};default:throw new TypeError("Unknown float type: "+name)}}function __embind_register_float(rawType,name,size){var shift=getShiftFromSize(size);name=readLatin1String(name);registerType(rawType,{name:name,"fromWireType":function(value){return value},"toWireType":function(destructors,value){return value},"argPackAdvance":8,"readValueFromPointer":floatReadValueFromPointer(name,shift),destructorFunction:null})}function new_(constructor,argumentList){if(!(constructor instanceof Function)){throw new TypeError("new_ called with constructor type "+typeof constructor+" which is not a function")}var dummy=createNamedFunction(constructor.name||"unknownFunctionName",function(){});dummy.prototype=constructor.prototype;var obj=new dummy;var r=constructor.apply(obj,argumentList);return r instanceof Object?r:obj}function runDestructors(destructors){while(destructors.length){var ptr=destructors.pop();var del=destructors.pop();del(ptr)}}function craftInvokerFunction(humanName,argTypes,classType,cppInvokerFunc,cppTargetFunc){var argCount=argTypes.length;if(argCount<2){throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!")}var isClassMethodFunc=argTypes[1]!==null&&classType!==null;var needsDestructorStack=false;for(var i=1;i<argTypes.length;++i){if(argTypes[i]!==null&&argTypes[i].destructorFunction===undefined){needsDestructorStack=true;break}}var returns=argTypes[0].name!=="void";var argsList="";var argsListWired="";for(var i=0;i<argCount-2;++i){argsList+=(i!==0?", ":"")+"arg"+i;argsListWired+=(i!==0?", ":"")+"arg"+i+"Wired"}var invokerFnBody="return function "+makeLegalFunctionName(humanName)+"("+argsList+") {\n"+"if (arguments.length !== "+(argCount-2)+") {\n"+"throwBindingError('function "+humanName+" called with ' + arguments.length + ' arguments, expected "+(argCount-2)+" args!');\n"+"}\n";if(needsDestructorStack){invokerFnBody+="var destructors = [];\n"}var dtorStack=needsDestructorStack?"destructors":"null";var args1=["throwBindingError","invoker","fn","runDestructors","retType","classParam"];var args2=[throwBindingError,cppInvokerFunc,cppTargetFunc,runDestructors,argTypes[0],argTypes[1]];if(isClassMethodFunc){invokerFnBody+="var thisWired = classParam.toWireType("+dtorStack+", this);\n"}for(var i=0;i<argCount-2;++i){invokerFnBody+="var arg"+i+"Wired = argType"+i+".toWireType("+dtorStack+", arg"+i+"); // "+argTypes[i+2].name+"\n";args1.push("argType"+i);args2.push(argTypes[i+2])}if(isClassMethodFunc){argsListWired="thisWired"+(argsListWired.length>0?", ":"")+argsListWired}invokerFnBody+=(returns?"var rv = ":"")+"invoker(fn"+(argsListWired.length>0?", ":"")+argsListWired+");\n";if(needsDestructorStack){invokerFnBody+="runDestructors(destructors);\n"}else{for(var i=isClassMethodFunc?1:2;i<argTypes.length;++i){var paramName=i===1?"thisWired":"arg"+(i-2)+"Wired";if(argTypes[i].destructorFunction!==null){invokerFnBody+=paramName+"_dtor("+paramName+"); // "+argTypes[i].name+"\n";args1.push(paramName+"_dtor");args2.push(argTypes[i].destructorFunction)}}}if(returns){invokerFnBody+="var ret = retType.fromWireType(rv);\n"+"return ret;\n"}else{}invokerFnBody+="}\n";args1.push(invokerFnBody);var invokerFunction=new_(Function,args1).apply(null,args2);return invokerFunction}function ensureOverloadTable(proto,methodName,humanName){if(undefined===proto[methodName].overloadTable){var prevFunc=proto[methodName];proto[methodName]=function(){if(!proto[methodName].overloadTable.hasOwnProperty(arguments.length)){throwBindingError("Function '"+humanName+"' called with an invalid number of arguments ("+arguments.length+") - expects one of ("+proto[methodName].overloadTable+")!")}return proto[methodName].overloadTable[arguments.length].apply(this,arguments)};proto[methodName].overloadTable=[];proto[methodName].overloadTable[prevFunc.argCount]=prevFunc}}function exposePublicSymbol(name,value,numArguments){if(Module.hasOwnProperty(name)){if(undefined===numArguments||undefined!==Module[name].overloadTable&&undefined!==Module[name].overloadTable[numArguments]){throwBindingError("Cannot register public name '"+name+"' twice")}ensureOverloadTable(Module,name,name);if(Module.hasOwnProperty(numArguments)){throwBindingError("Cannot register multiple overloads of a function with the same number of arguments ("+numArguments+")!")}Module[name].overloadTable[numArguments]=value}else{Module[name]=value;if(undefined!==numArguments){Module[name].numArguments=numArguments}}}function heap32VectorToArray(count,firstElement){var array=[];for(var i=0;i<count;i++){array.push(HEAP32[(firstElement>>2)+i])}return array}function replacePublicSymbol(name,value,numArguments){if(!Module.hasOwnProperty(name)){throwInternalError("Replacing nonexistant public symbol")}if(undefined!==Module[name].overloadTable&&undefined!==numArguments){Module[name].overloadTable[numArguments]=value}else{Module[name]=value;Module[name].argCount=numArguments}}function dynCallLegacy(sig,ptr,args){var f=Module["dynCall_"+sig];return args&&args.length?f.apply(null,[ptr].concat(args)):f.call(null,ptr)}function dynCall(sig,ptr,args){if(sig.includes("j")){return dynCallLegacy(sig,ptr,args)}return getWasmTableEntry(ptr).apply(null,args)}function getDynCaller(sig,ptr){var argCache=[];return function(){argCache.length=0;Object.assign(argCache,arguments);return dynCall(sig,ptr,argCache)}}function embind__requireFunction(signature,rawFunction){signature=readLatin1String(signature);function makeDynCaller(){if(signature.includes("j")){return getDynCaller(signature,rawFunction)}return getWasmTableEntry(rawFunction)}var fp=makeDynCaller();if(typeof fp!="function"){throwBindingError("unknown function pointer with signature "+signature+": "+rawFunction)}return fp}var UnboundTypeError=undefined;function getTypeName(type){var ptr=___getTypeName(type);var rv=readLatin1String(ptr);_free(ptr);return rv}function throwUnboundTypeError(message,types){var unboundTypes=[];var seen={};function visit(type){if(seen[type]){return}if(registeredTypes[type]){return}if(typeDependencies[type]){typeDependencies[type].forEach(visit);return}unboundTypes.push(type);seen[type]=true}types.forEach(visit);throw new UnboundTypeError(message+": "+unboundTypes.map(getTypeName).join([", "]))}function __embind_register_function(name,argCount,rawArgTypesAddr,signature,rawInvoker,fn){var argTypes=heap32VectorToArray(argCount,rawArgTypesAddr);name=readLatin1String(name);rawInvoker=embind__requireFunction(signature,rawInvoker);exposePublicSymbol(name,function(){throwUnboundTypeError("Cannot call "+name+" due to unbound types",argTypes)},argCount-1);whenDependentTypesAreResolved([],argTypes,function(argTypes){var invokerArgsArray=[argTypes[0],null].concat(argTypes.slice(1));replacePublicSymbol(name,craftInvokerFunction(name,invokerArgsArray,null,rawInvoker,fn),argCount-1);return[]})}function integerReadValueFromPointer(name,shift,signed){switch(shift){case 0:return signed?function readS8FromPointer(pointer){return HEAP8[pointer]}:function readU8FromPointer(pointer){return HEAPU8[pointer]};case 1:return signed?function readS16FromPointer(pointer){return HEAP16[pointer>>1]}:function readU16FromPointer(pointer){return HEAPU16[pointer>>1]};case 2:return signed?function readS32FromPointer(pointer){return HEAP32[pointer>>2]}:function readU32FromPointer(pointer){return HEAPU32[pointer>>2]};default:throw new TypeError("Unknown integer type: "+name)}}function __embind_register_integer(primitiveType,name,size,minRange,maxRange){name=readLatin1String(name);if(maxRange===-1){maxRange=4294967295}var shift=getShiftFromSize(size);var fromWireType=value=>value;if(minRange===0){var bitshift=32-8*size;fromWireType=value=>value<<bitshift>>>bitshift}var isUnsignedType=name.includes("unsigned");var checkAssertions=(value,toTypeName)=>{};var toWireType;if(isUnsignedType){toWireType=function(destructors,value){checkAssertions(value,this.name);return value>>>0}}else{toWireType=function(destructors,value){checkAssertions(value,this.name);return value}}registerType(primitiveType,{name:name,"fromWireType":fromWireType,"toWireType":toWireType,"argPackAdvance":8,"readValueFromPointer":integerReadValueFromPointer(name,shift,minRange!==0),destructorFunction:null})}function __embind_register_memory_view(rawType,dataTypeIndex,name){var typeMapping=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array];var TA=typeMapping[dataTypeIndex];function decodeMemoryView(handle){handle=handle>>2;var heap=HEAPU32;var size=heap[handle];var data=heap[handle+1];return new TA(buffer,data,size)}name=readLatin1String(name);registerType(rawType,{name:name,"fromWireType":decodeMemoryView,"argPackAdvance":8,"readValueFromPointer":decodeMemoryView},{ignoreDuplicateRegistrations:true})}function __embind_register_std_string(rawType,name){name=readLatin1String(name);var stdStringIsUTF8=name==="std::string";registerType(rawType,{name:name,"fromWireType":function(value){var length=HEAPU32[value>>2];var str;if(stdStringIsUTF8){var decodeStartPtr=value+4;for(var i=0;i<=length;++i){var currentBytePtr=value+4+i;if(i==length||HEAPU8[currentBytePtr]==0){var maxRead=currentBytePtr-decodeStartPtr;var stringSegment=UTF8ToString(decodeStartPtr,maxRead);if(str===undefined){str=stringSegment}else{str+=String.fromCharCode(0);str+=stringSegment}decodeStartPtr=currentBytePtr+1}}}else{var a=new Array(length);for(var i=0;i<length;++i){a[i]=String.fromCharCode(HEAPU8[value+4+i])}str=a.join("")}_free(value);return str},"toWireType":function(destructors,value){if(value instanceof ArrayBuffer){value=new Uint8Array(value)}var getLength;var valueIsOfTypeString=typeof value=="string";if(!(valueIsOfTypeString||value instanceof Uint8Array||value instanceof Uint8ClampedArray||value instanceof Int8Array)){throwBindingError("Cannot pass non-string to std::string")}if(stdStringIsUTF8&&valueIsOfTypeString){getLength=()=>lengthBytesUTF8(value)}else{getLength=()=>value.length}var length=getLength();var ptr=_malloc(4+length+1);HEAPU32[ptr>>2]=length;if(stdStringIsUTF8&&valueIsOfTypeString){stringToUTF8(value,ptr+4,length+1)}else{if(valueIsOfTypeString){for(var i=0;i<length;++i){var charCode=value.charCodeAt(i);if(charCode>255){_free(ptr);throwBindingError("String has UTF-16 code units that do not fit in 8 bits")}HEAPU8[ptr+4+i]=charCode}}else{for(var i=0;i<length;++i){HEAPU8[ptr+4+i]=value[i]}}}if(destructors!==null){destructors.push(_free,ptr)}return ptr},"argPackAdvance":8,"readValueFromPointer":simpleReadValueFromPointer,destructorFunction:function(ptr){_free(ptr)}})}function __embind_register_std_wstring(rawType,charSize,name){name=readLatin1String(name);var decodeString,encodeString,getHeap,lengthBytesUTF,shift;if(charSize===2){decodeString=UTF16ToString;encodeString=stringToUTF16;lengthBytesUTF=lengthBytesUTF16;getHeap=()=>HEAPU16;shift=1}else if(charSize===4){decodeString=UTF32ToString;encodeString=stringToUTF32;lengthBytesUTF=lengthBytesUTF32;getHeap=()=>HEAPU32;shift=2}registerType(rawType,{name:name,"fromWireType":function(value){var length=HEAPU32[value>>2];var HEAP=getHeap();var str;var decodeStartPtr=value+4;for(var i=0;i<=length;++i){var currentBytePtr=value+4+i*charSize;if(i==length||HEAP[currentBytePtr>>shift]==0){var maxReadBytes=currentBytePtr-decodeStartPtr;var stringSegment=decodeString(decodeStartPtr,maxReadBytes);if(str===undefined){str=stringSegment}else{str+=String.fromCharCode(0);str+=stringSegment}decodeStartPtr=currentBytePtr+charSize}}_free(value);return str},"toWireType":function(destructors,value){if(!(typeof value=="string")){throwBindingError("Cannot pass non-string to C++ string type "+name)}var length=lengthBytesUTF(value);var ptr=_malloc(4+length+charSize);HEAPU32[ptr>>2]=length>>shift;encodeString(value,ptr+4,length+charSize);if(destructors!==null){destructors.push(_free,ptr)}return ptr},"argPackAdvance":8,"readValueFromPointer":simpleReadValueFromPointer,destructorFunction:function(ptr){_free(ptr)}})}function __embind_register_void(rawType,name){name=readLatin1String(name);registerType(rawType,{isVoid:true,name:name,"argPackAdvance":0,"fromWireType":function(){return undefined},"toWireType":function(destructors,o){return undefined}})}function requireRegisteredType(rawType,humanName){var impl=registeredTypes[rawType];if(undefined===impl){throwBindingError(humanName+" has unknown type "+getTypeName(rawType))}return impl}function __emval_as(handle,returnType,destructorsRef){handle=Emval.toValue(handle);returnType=requireRegisteredType(returnType,"emval::as");var destructors=[];var rd=Emval.toHandle(destructors);HEAP32[destructorsRef>>2]=rd;return returnType["toWireType"](destructors,handle)}var emval_symbols={};function getStringOrSymbol(address){var symbol=emval_symbols[address];if(symbol===undefined){return readLatin1String(address)}return symbol}var emval_methodCallers=[];function __emval_call_void_method(caller,handle,methodName,args){caller=emval_methodCallers[caller];handle=Emval.toValue(handle);methodName=getStringOrSymbol(methodName);caller(handle,methodName,null,args)}function __emval_addMethodCaller(caller){var id=emval_methodCallers.length;emval_methodCallers.push(caller);return id}function __emval_lookupTypes(argCount,argTypes){var a=new Array(argCount);for(var i=0;i<argCount;++i){a[i]=requireRegisteredType(HEAP32[(argTypes>>2)+i],"parameter "+i)}return a}var emval_registeredMethods=[];function __emval_get_method_caller(argCount,argTypes){var types=__emval_lookupTypes(argCount,argTypes);var retType=types[0];var signatureName=retType.name+"_$"+types.slice(1).map(function(t){return t.name}).join("_")+"$";var returnId=emval_registeredMethods[signatureName];if(returnId!==undefined){return returnId}var params=["retType"];var args=[retType];var argsList="";for(var i=0;i<argCount-1;++i){argsList+=(i!==0?", ":"")+"arg"+i;params.push("argType"+i);args.push(types[1+i])}var functionName=makeLegalFunctionName("methodCaller_"+signatureName);var functionBody="return function "+functionName+"(handle, name, destructors, args) {\n";var offset=0;for(var i=0;i<argCount-1;++i){functionBody+="    var arg"+i+" = argType"+i+".readValueFromPointer(args"+(offset?"+"+offset:"")+");\n";offset+=types[i+1]["argPackAdvance"]}functionBody+="    var rv = handle[name]("+argsList+");\n";for(var i=0;i<argCount-1;++i){if(types[i+1]["deleteObject"]){functionBody+="    argType"+i+".deleteObject(arg"+i+");\n"}}if(!retType.isVoid){functionBody+="    return retType.toWireType(destructors, rv);\n"}functionBody+="};\n";params.push(functionBody);var invokerFunction=new_(Function,params).apply(null,args);returnId=__emval_addMethodCaller(invokerFunction);emval_registeredMethods[signatureName]=returnId;return returnId}function __emval_get_property(handle,key){handle=Emval.toValue(handle);key=Emval.toValue(key);return Emval.toHandle(handle[key])}function __emval_incref(handle){if(handle>4){emval_handle_array[handle].refcount+=1}}function __emval_new_cstring(v){return Emval.toHandle(getStringOrSymbol(v))}function __emval_run_destructors(handle){var destructors=Emval.toValue(handle);runDestructors(destructors);__emval_decref(handle)}function __emval_take_value(type,argv){type=requireRegisteredType(type,"_emval_take_value");var v=type["readValueFromPointer"](argv);return Emval.toHandle(v)}function _abort(){abort("")}function _emscripten_memcpy_big(dest,src,num){HEAPU8.copyWithin(dest,src,src+num)}function getHeapMax(){return 2147483648}function emscripten_realloc_buffer(size){try{wasmMemory.grow(size-buffer.byteLength+65535>>>16);updateGlobalBufferAndViews(wasmMemory.buffer);return 1}catch(e){}}function _emscripten_resize_heap(requestedSize){var oldSize=HEAPU8.length;requestedSize=requestedSize>>>0;var maxHeapSize=getHeapMax();if(requestedSize>maxHeapSize){return false}let alignUp=(x,multiple)=>x+(multiple-x%multiple)%multiple;for(var cutDown=1;cutDown<=4;cutDown*=2){var overGrownHeapSize=oldSize*(1+.2/cutDown);overGrownHeapSize=Math.min(overGrownHeapSize,requestedSize+100663296);var newSize=Math.min(maxHeapSize,alignUp(Math.max(requestedSize,overGrownHeapSize),65536));var replacement=emscripten_realloc_buffer(newSize);if(replacement){return true}}return false}embind_init_charCodes();BindingError=Module["BindingError"]=extendError(Error,"BindingError");InternalError=Module["InternalError"]=extendError(Error,"InternalError");init_emval();UnboundTypeError=Module["UnboundTypeError"]=extendError(Error,"UnboundTypeError");var asmLibraryArg={"e":___cxa_allocate_exception,"d":___cxa_throw,"o":__embind_register_bigint,"u":__embind_register_bool,"t":__embind_register_emval,"g":__embind_register_float,"h":__embind_register_function,"b":__embind_register_integer,"a":__embind_register_memory_view,"f":__embind_register_std_string,"c":__embind_register_std_wstring,"v":__embind_register_void,"j":__emval_as,"n":__emval_call_void_method,"s":__emval_decref,"m":__emval_get_method_caller,"k":__emval_get_property,"l":__emval_incref,"x":__emval_new_cstring,"w":__emval_run_destructors,"i":__emval_take_value,"p":_abort,"r":_emscripten_memcpy_big,"q":_emscripten_resize_heap};var asm=createWasm();var ___wasm_call_ctors=Module["___wasm_call_ctors"]=function(){return(___wasm_call_ctors=Module["___wasm_call_ctors"]=Module["asm"]["z"]).apply(null,arguments)};var _main=Module["_main"]=function(){return(_main=Module["_main"]=Module["asm"]["B"]).apply(null,arguments)};var ___getTypeName=Module["___getTypeName"]=function(){return(___getTypeName=Module["___getTypeName"]=Module["asm"]["C"]).apply(null,arguments)};var ___embind_register_native_and_builtin_types=Module["___embind_register_native_and_builtin_types"]=function(){return(___embind_register_native_and_builtin_types=Module["___embind_register_native_and_builtin_types"]=Module["asm"]["D"]).apply(null,arguments)};var _malloc=Module["_malloc"]=function(){return(_malloc=Module["_malloc"]=Module["asm"]["E"]).apply(null,arguments)};var _free=Module["_free"]=function(){return(_free=Module["_free"]=Module["asm"]["F"]).apply(null,arguments)};var stackAlloc=Module["stackAlloc"]=function(){return(stackAlloc=Module["stackAlloc"]=Module["asm"]["G"]).apply(null,arguments)};var ___cxa_is_pointer_type=Module["___cxa_is_pointer_type"]=function(){return(___cxa_is_pointer_type=Module["___cxa_is_pointer_type"]=Module["asm"]["H"]).apply(null,arguments)};var calledRun;function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}var calledMain=false;dependenciesFulfilled=function runCaller(){if(!calledRun)run();if(!calledRun)dependenciesFulfilled=runCaller};function callMain(args){var entryFunction=Module["_main"];args=args||[];args.unshift(thisProgram);var argc=args.length;var argv=stackAlloc((argc+1)*4);var argv_ptr=argv>>2;args.forEach(arg=>{HEAP32[argv_ptr++]=allocateUTF8OnStack(arg)});HEAP32[argv_ptr]=0;try{var ret=entryFunction(argc,argv);exit(ret,true);return ret}catch(e){return handleException(e)}finally{calledMain=true}}function run(args){args=args||arguments_;if(runDependencies>0){return}preRun();if(runDependencies>0){return}function doRun(){if(calledRun)return;calledRun=true;Module["calledRun"]=true;if(ABORT)return;initRuntime();preMain();readyPromiseResolve(Module);if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();if(shouldRunNow)callMain(args);postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(function(){setTimeout(function(){Module["setStatus"]("")},1);doRun()},1)}else{doRun()}}Module["run"]=run;function exit(status,implicit){EXITSTATUS=status;procExit(status)}function procExit(code){EXITSTATUS=code;if(!keepRuntimeAlive()){if(Module["onExit"])Module["onExit"](code);ABORT=true}quit_(code,new ExitStatus(code))}if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}var shouldRunNow=true;if(Module["noInitialRun"])shouldRunNow=false;run();


  return converter.ready
}
);
})();
if (typeof exports === 'object' && "object" === 'object')
  module.exports = converter;
else if (typeof define === 'function' && __webpack_require__.amdO)
  define([], function() { return converter; });
else if (typeof exports === 'object')
  exports["converter"] = converter;

/*** EXPORTS FROM exports-loader ***/



/***/ }),

/***/ "./src/img/folder.png":
/*!****************************!*\
  !*** ./src/img/folder.png ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "/img/folder.png");

/***/ }),

/***/ "./src/img/palette.png":
/*!*****************************!*\
  !*** ./src/img/palette.png ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "/img/palette.png");

/***/ }),

/***/ "./src/img/palette2.png":
/*!******************************!*\
  !*** ./src/img/palette2.png ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "/img/palette2.png");

/***/ }),

/***/ "./src/img/pattern.png":
/*!*****************************!*\
  !*** ./src/img/pattern.png ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "/img/pattern.png");

/***/ }),

/***/ "./lib/converter/bin/converter.wasm":
/*!******************************************!*\
  !*** ./lib/converter/bin/converter.wasm ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "/wasm/converter.wasm");

/***/ }),

/***/ "./src/css/converters.css":
/*!********************************!*\
  !*** ./src/css/converters.css ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/js/convert/bayerMatrices.js":
/*!*****************************************!*\
  !*** ./src/js/convert/bayerMatrices.js ***!
  \*****************************************/
/***/ ((module) => {

const bayer4x4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
];

const bayer8x8 = [
    [0, 48, 12, 60, 3, 51, 15, 63],
    [32, 16, 44, 28, 35, 19, 47, 31],
    [8, 56, 4, 52, 11, 59, 7, 55],
    [40, 24, 36, 20, 43, 27, 39, 23],
    [2, 50, 14, 62, 1, 49, 13, 61],
    [34, 18, 46, 30, 33, 17, 45, 29],
    [10, 58, 6, 54, 9, 57, 5, 53],
    [42, 26, 38, 22, 41, 25, 37, 21]
];

const bayer16x16 = [
    [0, 128, 32, 160, 8, 136, 40, 168, 2, 130, 34, 162, 10, 138, 42, 170],
    [192, 64, 224, 96, 200, 72, 232, 104, 194, 66, 226, 98, 202, 74, 234, 106],
    [48, 176, 16, 144, 56, 184, 24, 152, 50, 178, 18, 146, 58, 186, 26, 154],
    [240, 112, 208, 80, 248, 120, 216, 88, 242, 114, 210, 82, 250, 122, 218, 90],
    [12, 140, 44, 172, 4, 132, 36, 164, 14, 142, 46, 174, 6, 134, 38, 166],
    [204, 76, 236, 108, 196, 68, 228, 100, 206, 78, 238, 110, 198, 70, 230, 102],
    [60, 188, 28, 156, 52, 180, 20, 148, 62, 190, 30, 158, 54, 182, 22, 150],
    [252, 124, 220, 92, 244, 116, 212, 84, 254, 126, 222, 94, 246, 118, 214, 86],
    [3, 131, 35, 163, 11, 139, 43, 171, 1, 129, 33, 161, 9, 137, 41, 169],
    [195, 67, 227, 99, 203, 75, 235, 107, 193, 65, 225, 97, 201, 73, 233, 105],
    [51, 179, 19, 147, 59, 187, 27, 155, 49, 177, 17, 145, 57, 185, 25, 153],
    [243, 115, 211, 83, 251, 123, 219, 91, 241, 113, 209, 81, 249, 121, 217, 89],
    [15, 143, 47, 175, 7, 135, 39, 167, 13, 141, 45, 173, 5, 133, 37, 165],
    [207, 79, 239, 111, 199, 71, 231, 103, 205, 77, 237, 109, 197, 69, 229, 101],
    [63, 191, 31, 159, 55, 183, 23, 151, 61, 189, 29, 157, 53, 181, 21, 149],
    [255, 127, 223, 95, 247, 119, 215, 87, 253, 125, 221, 93, 245, 117, 213, 85]
];

const custom4x4 = [
    [0, 0, 0, 1],
    [0, 5, 4, 2],
    [0, 0, 0, 3],
    [0, 0, 0, 0],
];

const custom8x8 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 13, 0, 0, 0, 8],
    [0, 15, 14, 12, 0, 10, 9, 7],
    [0, 0, 0, 11, 23, 0, 0, 6],
    [0, 0, 25, 24, 22, 0, 0, 0],
    [0, 0, 0, 3, 21, 0, 0, 18],
    [0, 5, 4, 2, 0, 20, 19, 17],
    [0, 0, 0, 1, 0, 0, 0, 16]
]; // yes, penises

const custom7x7 = [
    [1, 3, 37, 9, 11, 45, 43],
    [4, 2, 47, 12, 10, 26, 28],
    [30, 44, 17, 47, 36, 29, 27],
    [13, 15, 46, 5, 7, 38, 40],
    [16, 14, 42, 8, 6, 41, 39],
    [48, 22, 24, 31, 33, 18, 20],
    [35, 25, 23, 34, 32, 21, 19]
];

module.exports = {
    4: bayer4x4,
    8: bayer8x8,
    16: bayer16x16,
    c4: custom4x4,
    c8: custom8x8,
    c7: custom7x7
}

/***/ }),

/***/ "./src/js/convert/converterWASM.js":
/*!*****************************************!*\
  !*** ./src/js/convert/converterWASM.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _lib_converter_bin_converter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../lib/converter/bin/converter */ "./lib/converter/bin/converter.js");
/* harmony import */ var _lib_converter_bin_converter_wasm__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../lib/converter/bin/converter.wasm */ "./lib/converter/bin/converter.wasm");



// Since webpack will change the name and potentially the path of the
// `.wasm` file, we have to provide a `locateFile()` hook to redirect
// to the appropriate URL.
// More details: https://kripken.github.io/emscripten-site/docs/api_reference/module.html
const wasm = (0,_lib_converter_bin_converter__WEBPACK_IMPORTED_MODULE_0__.converter)({
  locateFile(path) {
    if (path.endsWith(`.wasm`)) {
      return _lib_converter_bin_converter_wasm__WEBPACK_IMPORTED_MODULE_1__["default"]
    }
    return path
  },
})

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (wasm);

/***/ }),

/***/ "./src/js/convert/dom.js":
/*!*******************************!*\
  !*** ./src/js/convert/dom.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   linkNumberRangeInputs: () => (/* binding */ linkNumberRangeInputs),
/* harmony export */   watchInput: () => (/* binding */ watchInput)
/* harmony export */ });
function watchInput(inputElement, callback) {
    inputElement.addEventListener('input', (event) => {
        callback(event.target.value);
    });  
    
    return new Proxy(inputElement, {
        set(target, property, value) {
            if (property === 'value') {
                const oldValue = target.value;
                target[property] = value;
                if (oldValue !== value) {
                    callback(value);
                }
                return true;
            }
            target[property] = value;
            return true;
        },
        get(target, property) {
            if (property === 'value') {
                return target.value;
            }
            return target[property];
        }
    });
}

function linkNumberRangeInputs(numberInp, rangeInp) {
    numberInp.addEventListener('input', e => rangeInp.value = e.target.value);
    rangeInp.addEventListener('input', e => numberInp.value = e.target.value);
}


/***/ }),

/***/ "./src/js/convert/imgur.js":
/*!*********************************!*\
  !*** ./src/js/convert/imgur.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   upload: () => (/* binding */ upload)
/* harmony export */ });
async function upload(image){
    const formData = new FormData();
    formData.append('image', image);
    formData.append('type', 'base64');

    const resp = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
            'Authorization': 'Client-ID 134a48816a3c4d6'
        },
        body: formData,
        redirect: 'follow'
    })
    const json = await resp.json();
    if(!json.success) throw new Error('Imgur upload eror');

    return json.data.link;
}

window.imgurUpload = upload;

/***/ }),

/***/ "./src/js/convert/imgzoom.js":
/*!***********************************!*\
  !*** ./src/js/convert/imgzoom.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
// Нагло спизжено у pxlsfiddle
// Модифицировано
const imgZoom = {
    dlg: null,
    canvas: null,
    scaleLabel: null,
    customLabel: null,
  
    scales: [2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 17, 20, 24, 28, 32], // empirically determined; originally 17 was 16, but a simple polynomial of n=3 fit showed that value was an outlier. So is 8, but by half, and scaling non-integer? no thanks.
    scaleIndex: 2, // scale = 4
  
    src: null,
  
    // get the mouse position relative to an image based on its original size
    getImgMousePos(element, e) {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const paddingRect = {
        left: parseInt(style.paddingLeft, 10),
        right: parseInt(style.paddingRight, 10),
        top: parseInt(style.paddingTop, 10),
        bottom: parseInt(style.paddingBottom, 10)
      };
  
      return {
        x: (e.clientX - rect.left - paddingRect.left) / (rect.width - (paddingRect.left + paddingRect.right)) * element.naturalWidth,
        y: (e.clientY - rect.top - paddingRect.top) / (rect.height - (paddingRect.top + paddingRect.bottom)) * element.naturalHeight
      };
    },
  
    // sets up event handlers for a given image element to pop up the zoom window
    createZoomHandler(el, cb) {
      el.onmouseenter = function () {
        imgZoom.src = el;
        const scale = imgZoom.scales[imgZoom.scaleIndex];
        imgZoom.scaleLabel.textContent = `${el.width}x${el.height}px; pixel zoom x${scale}`;
        imgZoom.canvas.width = el.naturalWidth;
        imgZoom.canvas.height = el.naturalHeight;
        imgZoom.canvas.getContext("2d").drawImage(el, 0, 0);
        imgZoom.dlg.style.display = "block";
      };
      el.onmouseleave = function () {
        imgZoom.src = null;
        imgZoom.customLabel.style.display = "none";
        imgZoom.dlg.style.display = "none";
      };
      el.onmousemove = function (e) {
        const scale = imgZoom.scales[imgZoom.scaleIndex];
  
        const mousePos = imgZoom.getImgMousePos(el, e);
        imgZoom.canvas.style.transform = `scale(${scale})`;
        imgZoom.canvas.style.left = `${imgZoom.dlg.offsetWidth / 2 - mousePos.x * scale - scale / 2}px`;
        imgZoom.canvas.style.top = `${imgZoom.dlg.offsetHeight / 2 - mousePos.y * scale - scale / 2}px`;
  
        if (typeof cb !== "undefined") {
          cb(el, mousePos, scale);
  
          return true;
        }
  
        return true;
      };
      el.onwheel = function (e) {
        if (e.altKey) {
          if (e.deltaY < 0) {
            imgZoom.scaleIndex = Math.min(imgZoom.scaleIndex + 1, imgZoom.scales.length - 1);
          } else if (e.deltaY > 0) {
            imgZoom.scaleIndex = Math.max(imgZoom.scaleIndex - 1, 0);
          }
          if (e.deltaY !== 0) {
            const scale = imgZoom.scales[imgZoom.scaleIndex];
            imgZoom.scaleLabel.textContent = `pixel zoom x${scale}`;
            el.onmousemove(e);
          }
          e.preventDefault();
        }
      };
      el.onclick = () => {
        if (!$(el).hasClass('zoomed')) {
          $(el).addClass('zoomed');
          $(el).css('width', '');
        } else {
          $(el).removeClass('zoomed');
          $(el).css('width', Math.min(parseInt($(el).parent().css('width')) / 2, $(el)[0].width));
          console.log($(el).parent().css('width'), $(el).parent(), 2)
        }
      }
    },
    refresh() {
      // imgZoom.canvas.width = imgZoom.src.width;
      // imgZoom.canvas.height = imgZoom.src.height;
      if (typeof imgZoom.src.naturalWidth !== "undefined") {
        imgZoom.canvas.width = imgZoom.src.naturalWidth;
        imgZoom.canvas.height = imgZoom.src.naturalHeight;
      } else {
        imgZoom.canvas.width = imgZoom.src.width;
        imgZoom.canvas.height = imgZoom.src.height;
      }
      imgZoom.canvas.getContext("2d").drawImage(imgZoom.src, 0, 0);
    },
    init() {
      const tmp = document.createElement("template");
      tmp.innerHTML = `<div id="_imgZoom" style="z-index:1555; background-color:rgba(0,0,0,0); position:fixed; top:0; right:0; border-width:0 0 2px 2px; border-style:solid; border-color:#000; border-radius:0 0 0 5px; padding:0 2px; text-align:right; pointer-events:none; display:none; width:50vw; height:50vh; overflow:hidden;"><canvas id="_imgZoomCanvas" style="position:absolute; image-rendering:-moz-crisp-edges; image-rendering:pixelated; transform-origin:0 0; transform:scale(4);"></canvas><strong id="_imgZoomLevel" style="background-color:#404040; border-radius:5px 0 0 0; padding:2px; position:absolute; bottom:0; right:0;">pixel zoom x4</strong><strong id="_imgZoomLabel" style="background-color:#404040; border-radius:0 5px 0 0; padding:2px; position:absolute; bottom:0; left:0; max-width:300px"></strong><div id="_imgZoomCrosshair" style="opacity:0.25;"><div style="background-color:#000; width:2px; height:20px; position:absolute; top:calc(50% - 10px); left:calc(50% - 1px);"></div><div style="background-color:#000; height:2px; width:20px; position:absolute; top:calc(50% - 1px); left:calc(50% - 10px);"></div></div></div>`;
      this.dlg = tmp.content.firstChild;
      document.body.appendChild(this.dlg);
      this.canvas = document.getElementById("_imgZoomCanvas");
      this.scaleLabel = document.getElementById("_imgZoomLevel");
      this.customLabel = document.getElementById("_imgZoomLabel");
  
      // zoom handlers for pixel images
      const pixelImages = document.querySelectorAll(".zoom");
      for (const imgElement of pixelImages) {
        this.createZoomHandler(imgElement);
      }
  
      // zoom handlers for future pixel images
      function cb(mutations) {
        for (const mut of mutations) {
          for (const addedNode of mut.addedNodes) {
            if (addedNode.querySelectorAll) {
              const zoomElements = addedNode.querySelectorAll("img.zoom");
              for (const el of zoomElements) {
                imgZoom.createZoomHandler(el);
              }
            }
          }
        }
      };
      const observer = new MutationObserver(cb);
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  };
  imgZoom.init();

  module.exports = imgZoom

/***/ }),

/***/ "./src/js/convert/main.js":
/*!********************************!*\
  !*** ./src/js/convert/main.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_converters_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../css/converters.css */ "./src/css/converters.css");
/* harmony import */ var _img_folder_png__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../img/folder.png */ "./src/img/folder.png");
/* harmony import */ var _img_pattern_png__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../img/pattern.png */ "./src/img/pattern.png");
/* harmony import */ var _img_palette_png__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../img/palette.png */ "./src/img/palette.png");
/* harmony import */ var _img_palette2_png__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../img/palette2.png */ "./src/img/palette2.png");
/* harmony import */ var _palettes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./palettes */ "./src/js/convert/palettes.js");
/* harmony import */ var _setImmediate__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./setImmediate */ "./src/js/convert/setImmediate.js");
/* harmony import */ var _setImmediate__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_setImmediate__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _converterWASM__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./converterWASM */ "./src/js/convert/converterWASM.js");
/* harmony import */ var _imgzoom__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./imgzoom */ "./src/js/convert/imgzoom.js");
/* harmony import */ var _imgzoom__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_imgzoom__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _openImage__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./openImage */ "./src/js/convert/openImage.js");
/* harmony import */ var _imgur__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./imgur */ "./src/js/convert/imgur.js");
/* harmony import */ var _translate__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../translate */ "./src/js/translate.js");
/* harmony import */ var _utils_api__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../utils/api */ "./src/js/utils/api.js");
/* harmony import */ var _resize__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./resize */ "./src/js/convert/resize.js");
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./dom */ "./src/js/convert/dom.js");
/* harmony import */ var _utils_misc__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../utils/misc */ "./src/js/utils/misc.js");
/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
/* provided dependency */ var toastr = __webpack_require__(/*! toastr */ "./node_modules/toastr/toastr.js");










const clrManip = __webpack_require__(/*! ./color */ "./src/js/convert/color.js");
const bayer = __webpack_require__(/*! ./bayerMatrices */ "./src/js/convert/bayerMatrices.js");
const importedPatterns = __webpack_require__(/*! ./patterns */ "./src/js/convert/patterns.js");


(async () => {
    const module = await _converterWASM__WEBPACK_IMPORTED_MODULE_7__["default"]
    window.convModule = module;
    window.clrManip = clrManip;
})()

;









(0,_translate__WEBPACK_IMPORTED_MODULE_11__.init)();

let resizeKeepAspectRatio = true;

// автоматический корректор инпута
$('input[type=number]').on('change', (e) => {
    let input = e.target;

    if (input.max) {
        input.value = Math.min(input.value, input.max);
    }

    if (input.min) {
        input.value = Math.max(input.value, input.min);
    }
});

let utils = {
    // технически, любой путь подойдёт
    isURLValid(url) {
        if (!url || !url.length) return false;

        try {
            new URL(url);
        } catch {
            return false;
        }

        return true
    },
    isURLImage(url) {
        return new RegExp('\.(png|jpg|gif)$').test(url);
    }
}

const paletteSel = $('#paletteSel');
function applyPalettes(selected = 'pixelplanet') {
    Object.keys(_palettes__WEBPACK_IMPORTED_MODULE_5__["default"]).forEach(key => {
        const newEl = $(`<option id="p_${key}">${key}</option>`);
        newEl.val(key);

        if (key === selected)
            newEl.attr('selected', '');

        paletteSel.prepend(newEl);
    });
    paletteSel.append('<option value="_custom">custom</option>');
}

paletteSel.on('change', () => {
    const val = paletteSel.val();

    if (val === "_custom") {
        $('#userPalette').show();
    } else {
        $('#userPalette').hide();

        const pal = _palettes__WEBPACK_IMPORTED_MODULE_5__["default"][val];

        palUtils.setPalette(pal);
        palUtils.updatePalette();

        visualizePalette();

        converterPreload(false);
    }

    palUtils.usedColors = [];
    patUtils.usedColors = [];
});

$('#userPalette').attr('placeholder',
    '[[r, g, b],[r, g, b], ...] | ["#hex", "#hex", ...] | [[r, g, b], ["#hex"], ...]');
$('#userPalette').on('input', () => {
    tryParseUserPalette();
    visualizePalette();
});

function visualizePalette() {
    const pal = paletteRGB;

    $('#palette').children().remove();

    pal.forEach(col => {
        const el = $(`<div class="paletteCol" style="background-color:rgb(${col.join(',')})"></div>`);
        $('#palette').append(el);
    });
}


function tryParseUserPalette() {
    try {
        let tempPal = JSON.parse($('#userPalette').val())

        if (tempPal.length === 0)
            throw new Error('Null palette length')

        tempPal = tempPal.map(el => {
            if (typeof el === 'string') { // hex
                if (el.startsWith('#')) el = el.slice(1);

                return clrManip.hex2rgb(el);
            } else if (typeof el === 'object' && el.length === 3) { // rgb array
                return el
            }

            throw new Error('Unknown color type')
        })

        palUtils.setPalette(tempPal);
        palUtils.updatePalette();

        converterPreload(false);
    } catch (e) {
        $('#userPalette').css('background-color', 'rgb(249,141,141)');
        return
    }
    $('#userPalette').css('background-color', '')
}

let paletteRGB = _palettes__WEBPACK_IMPORTED_MODULE_5__["default"]['game.main'],
    paletteLAB,
    paletteOKLab,
    palette32;

let palUtils = {
    link: null,
    converterInterval: null,
    usedColors: [],
    rgb2lab: clrManip.rgb2lab,
    rgb2uint32: clrManip.rgb2uint32,
    setPalette(palette) {
        paletteRGB = palette
    },
    updatePalette() {
        paletteLAB = paletteRGB.map(this.rgb2lab);
        paletteOKLab = paletteRGB.map(clrManip.rgb2okLAB);
        palette32 = paletteRGB.map(this.rgb2uint32);


        this.ditherPalette();
    },
    ditherPalette() {
        if($('#ditheringMode').val() !== 'check') return;

        // спи.. взято на вооружение!
        this.colorValuesExRGB = [];
        this.colorValuesExLab = [];
        this.colorValuesExOkLab = [];

        const isOklab = $('#colorfunc').val() === 'oklab';
        const clrDiffFn = isOklab ? clrManip.mOklabDiff : clrManip.mciede2000;
        const paletteWithL = isOklab ? paletteOKLab : paletteLAB;
        // lab max diff is 120
        // oklab max diff is ~1.509 
        // but realistic max between oklab black/white is ~1.0
        const thresMulti = isOklab ? 0.01 : 1.2

        const threshold = +$('#palThresold').val() * thresMulti; // UI is presented as a range of 0..100, but ciede2000 maxes out at ~120.
        paletteRGB.forEach((col1, col1idx) => {
            paletteRGB.forEach((col2, col2idx) => {
                if (col2idx >= col1idx) {
                    if (clrDiffFn(col1, col2) <= threshold) {
                        const mix = clrManip.mixColors(col1, col2);
                        const col1lab = paletteWithL[col1idx];
                        const col2lab = paletteWithL[col2idx];
                        if (col1lab[0] >= col2lab[0]) { // put lighter colors first regardless of combo
                            this.colorValuesExRGB.push([mix[0], mix[1], mix[2], col1idx, col2idx]);
                        } else {
                            this.colorValuesExRGB.push([mix[0], mix[1], mix[2], col2idx, col1idx]);
                        }
                    }
                }
            });
        });
        this.colorValuesExRGB.forEach((val, idx) => {
            if(isOklab){
                this.colorValuesExOkLab[idx] = clrManip.rgb2okLAB(val.map(x => x | 0));
                
                this.colorValuesExOkLab[idx][3] = val[3];
                this.colorValuesExOkLab[idx][4] = val[4];

            }else{
                this.colorValuesExLab[idx] = clrManip.rgb2lab(val);
                this.colorValuesExLab[idx][3] = val[3];
                this.colorValuesExLab[idx][4] = val[4];
            }
        });
        console.log(this.colorValuesExRGB.length);
    },
    ditherTypes: {
        //      X   7
        //  3   5   1
        floydSteinberg: [
            [7 / 16, 1, 0],
            [3 / 16, -1, 1],
            [5 / 16, 0, 1],
            [1 / 16, 1, 1]
        ],
        //          X   8   4 
        //  2   4   8   4   2
        //  1   2   4   2   1
        stuki: [
            [8 / 42, 1, 0],
            [4 / 42, 2, 0],
            [2 / 42, -2, 1],
            [4 / 42, -1, 1],
            [8 / 42, 0, 1],
            [4 / 42, 1, 1],
            [2 / 42, 2, 1],
            [1 / 42, -2, 2],
            [2 / 42, -1, 2],
            [4 / 42, 0, 2],
            [2 / 42, 1, 2],
            [1 / 42, 2, 2],
        ],
        //          X   4   3
        //  1   2   3   2   1
        sierraTwo: [
            [4 / 16, 1, 0],
            [3 / 16, 2, 0],
            [1 / 16, -2, 1],
            [2 / 16, -1, 1],
            [3 / 16, 0, 1],
            [2 / 16, 1, 1],
            [1 / 16, 2, 1],
        ],
    },
    /**
     * 
     * @param {ImageData} imageData 
     * @param {String} dithering 
     */
    * errorDithering(imageData, dithering) {
        const width = imageData.width;
        const height = imageData.height;

        const serp = $('#serp')[0].checked;
        let imgData = imageData.data;

        let deFunction;
        let palette = paletteRGB;

        const buf32 = new Uint32Array(imgData.buffer);

        switch ($('#colorfunc').val()) {
            case 'lwrgbde':
                deFunction = clrManip.lwrgbde;
                break
            case 'ciede1994':
                deFunction = clrManip.mciede1994mix;
                palette = paletteLAB;
                break
            case 'ciede2000':
                deFunction = clrManip.mciede2000mix;
                palette = paletteLAB;
                break
            case 'cmcic':
                deFunction = clrManip.cmcicMix;
                palette = paletteLAB;
                break
            case 'eucl':
                deFunction = clrManip.euclidian;
                break
            case 'oklab':
                deFunction = clrManip.mOklabDiffMix;
                palette = paletteOKLab;
                break
        }

        let cntr = 0;
        let dir = 1;

        for (let y = 0; y < height; y++) {
            for (let x = (dir > 0 ? 0 : width - 1), max = (dir > 0 ? width : 0); x !== max; x += dir) {
                const i = x + y * width;

                const col32 = buf32[i];

                if (col32 >> 24 !== 0) {
                    const color = clrManip.uint32toRGB(col32);
                    const rgb = col32 & 0xffffff;
                    // console.log(col32, color, buf32)

                    let matchIndex = -1;
                    const usedIndex = this.usedColors[rgb];
                    if (usedIndex !== undefined) {
                        matchIndex = usedIndex;
                    } else {
                        matchIndex = clrManip.mapcolor(color, palette, deFunction);
                        this.usedColors[rgb] = matchIndex;
                    }
                    const matchingColor32 = palette32[matchIndex],
                        matchingColor = paletteRGB[matchIndex];

                    buf32[i] = matchingColor32;

                    if (dithering) {
                        const distR = color[0] - matchingColor[0],
                            distG = color[1] - matchingColor[1],
                            distB = color[2] - matchingColor[2];

                        for (let j = (~dir ? 0 : dithering.length - 1), end = (~dir ? dithering.length : 0); j != end; j += dir) {
                            const p = dithering[j];

                            const [mult, X, Y] = [p[0], x + p[1] * dir, y + p[2]];
                            if (X < 0 || X >= width || Y < 0 || Y >= height)
                                continue;

                            const i = X + Y * width;
                            let rgb = clrManip.uint32toRGB(buf32[i]);

                            const I = i * 4;

                            imgData[I] = Math.max(0, Math.min(255, rgb[0] + distR * mult));
                            imgData[I + 1] = Math.max(0, Math.min(255, rgb[1] + distG * mult));
                            imgData[I + 2] = Math.max(0, Math.min(255, rgb[2] + distB * mult));
                        }
                    }
                } else {
                    buf32[i] = 0;
                }

                if (cntr++ % 2000 === 0) {
                    yield cntr / buf32.length;
                }
            }


            if (serp)
                dir *= -1;
        }

        return imageData;
    },
    * checkboardDithering(imageData) { // дупликация кода конечно, но мне пофег
        const width = imageData.width;
        let imgData = imageData.data;

        let deFunction;
        let palette = this.colorValuesExRGB;
        switch ($('#colorfunc').val()) {
            case 'lwrgbde':
                deFunction = clrManip.lwrgbde;
                break
            case 'ciede2000':
                deFunction = clrManip.mciede2000mix;
                palette = this.colorValuesExLab;
                break
            case 'cmcic':
                deFunction = clrManip.cmcicMix;
                palette = this.colorValuesExLab;
                break
            case 'eucl':
                deFunction = clrManip.euclidian;
                break
            case 'oklab':
                deFunction = clrManip.mOklabDiffMix;
                palette = this.colorValuesExOkLab;
                break
        }

        const rowSize = width * 4;
        // палитра со смешанными цветами
        // в зависимости от расположения, цвет будет чередоваться
        let cntr = 0;
        for (let i = imgData.length - 1; i >= 0; i -= 4) {
            if (imgData[i] > 127) {
                let color = [imgData[i - 3], imgData[i - 2], imgData[i - 1]];
                const colorEnc = (color[0] << 16) + (color[1] << 8) + color[2];
                let matchIndex = -1;
                const usedIndex = this.usedColors[colorEnc];
                if (usedIndex !== undefined) {
                    matchIndex = usedIndex;
                } else {
                    matchIndex = clrManip.mapcolor(color, palette, deFunction);
                    this.usedColors[colorEnc] = matchIndex;
                }
                const matchingColor1 = this.colorValuesExRGB[matchIndex][3];
                const matchingColor2 = this.colorValuesExRGB[matchIndex][4];

                // x + y % 2
                if (((i - 3) % rowSize / 4 + Math.floor(i / rowSize)) % 2 === 0) {
                    matchIndex = matchingColor1;
                } else {
                    matchIndex = matchingColor2;
                }

                const matchingColor = paletteRGB[matchIndex];

                imgData[i] = 255;
                imgData[i - 3] = matchingColor[0];
                imgData[i - 2] = matchingColor[1];
                imgData[i - 1] = matchingColor[2];
            } else {
                imgData[i - 3] = 0;
                imgData[i - 2] = 0;
                imgData[i - 1] = 0;
                imgData[i] = 0;
            }

            if (cntr++ % 2000 === 0) {
                yield cntr / (imgData.length / 4);
            }
        }
        return imageData;
    },
    * orderedDithering(imageData, matrixSize, custom = false, mode = 1) {
        const M = bayer[custom ? ('c' + matrixSize) : matrixSize];

        // matrix maximum value
        const max = M.length ** 2;

        const width = imageData.width;
        let imgData = imageData.data;

        let deFunction;
        let palette = paletteRGB;
        switch ($('#colorfunc').val()) {
            case 'lwrgbde':
                deFunction = clrManip.lwrgbde;
                break
            case 'ciede2000':
                deFunction = clrManip.mciede2000mix;
                palette = paletteLAB;
                break
            case 'cmcic':
                deFunction = clrManip.cmcicMix;
                palette = paletteLAB;
                break
            case 'eucl':
                deFunction = clrManip.euclidian;
                break
            case 'oklab':
                deFunction = clrManip.mOklabDiffMix;
                palette = paletteOKLab;
                break
        }

        let cntr = 0;
        for (let i = 0; i < imgData.length; i += 4) {
            if (imgData[i + 3] > 127) {
                let origOffset = i / 4;
                let x = origOffset % width;
                let y = origOffset / width | 0; // отбрасывает числа после запятой
                let matrixThres = M[x % matrixSize][y % matrixSize];
                if (mode === 0) {
                    matrixThres = -matrixThres;
                } else if (mode == 2) {
                    matrixThres -= max / 2;
                }

                for (let j = 0; j < 3; j++) {
                    imgData[i + j] += matrixThres;
                } // цикл по rgb

                let color = [imgData[i], imgData[i + 1], imgData[i + 2]];

                const colorEnc = (color[0] << 16) + (color[1] << 8) + color[2];
                let matchIndex = -1;
                const usedIndex = this.usedColors[colorEnc];
                if (usedIndex !== undefined) {
                    matchIndex = usedIndex;
                } else {
                    matchIndex = clrManip.mapcolor(color, palette, deFunction);
                    //toastr.info(error);
                    this.usedColors[colorEnc] = matchIndex;
                }
                const matchingColor = paletteRGB[matchIndex];
                imgData[i] = matchingColor[0];
                imgData[i + 1] = matchingColor[1];
                imgData[i + 2] = matchingColor[2];
                imgData[i + 3] = 255;
            } else {
                imgData[i] = 0;
                imgData[i + 1] = 0;
                imgData[i + 2] = 0;
                imgData[i + 3] = 0;
            }
            if (cntr++ % 2000 === 0) {
                yield cntr / (imgData.length / 4);
            }
        }
        return imageData;
    }
}

let palImageChanged = false;
$('#palFolder').on('click', () => {
    (0,_openImage__WEBPACK_IMPORTED_MODULE_9__["default"])(dataURL => {
        palImageChanged = true;
        $('#palInput').val((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('[file]'));
        $('#palInput').data('source', 'dataURL');

        palUtils.dataURL = dataURL;

        converterPreload();
    })
})

$('#palGOBtn').on('click', () => {
    converterPreload();
});

$('#palInput').on('keydown', (e) => {
    $('#palInput')[0].dataset.source = "url";
    if (e.code === 'Enter') {
        converterPreload();
    } else {
        palImageChanged = true;
    }
});

$('#ditheringMode').on('change', () => {
    let val = $('#ditheringMode').val();

    if (val === 'ordered') {
        $('#ordMatrix').removeClass('hidden');
    } else {
        $('#ordMatrix').addClass('hidden');
    }

    if (val === 'check') {
        $('#thresoldDiv').removeClass('hidden');
    } else {
        $('#thresoldDiv').addClass('hidden');
    }

    // serpentine mode is only works for error dithering
    if (['f-s', 'stuki', 'sierra', 'sierra-lite'].includes(val)) {
        $('#serpBlock').removeClass('hidden');
    } else {
        $('#serpBlock').addClass('hidden');
    }
});

$('#palInput').on('paste', (e) => {
    let files = e.originalEvent.clipboardData.items;
    let images = [];
    for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image')) {
            images.push(files[i].getAsFile());
        };
    }
    if (!images.length) return;
    e.preventDefault();

    let image = images[0];

    const reader = new FileReader();
    reader.onload = function (ev) {
        $('#palInput').val((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('[clipboard]'));
        $('#palInput').data('source', 'dataURL');
        const tempImage = new Image();
        tempImage.onload = function () {
            palImageChanged = true;

            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = tempImage.width;
            tempCanvas.height = tempImage.height;
            const clipCtx = tempCanvas.getContext("2d");
            clipCtx.drawImage(tempImage, 0, 0);
            palUtils.dataURL = tempCanvas.toDataURL("image/png");
            converterPreload();
        };
        tempImage.src = ev.target.result;
    };
    reader.readAsDataURL(image);
});

(0,_dom__WEBPACK_IMPORTED_MODULE_14__.linkNumberRangeInputs)($('#resizeXInput')[0], $('#resizeXRange')[0])
;(0,_dom__WEBPACK_IMPORTED_MODULE_14__.linkNumberRangeInputs)($('#resizeYInput')[0], $('#resizeYRange')[0])

function converterPreload(showWarn = true) {
    let path = $('#palInput').val();
    if ($('#palInput').data('source') !== 'dataURL') {
        if (!path.length) {
            return showWarn && toastr.error((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('Choose a image!'));
        }

        if (utils.isURLValid(path)) {
            palUtils.link = path;
            startPaletteConverter(path);
        } else {
            return showWarn && toastr.error((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('Invalid link!'));
        }
    } else {
        startPaletteConverter(palUtils.dataURL);
    }
}

function startPaletteConverter(url) {
    clearImmediate(palUtils.converterInterval);

    let tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    tempImg.src = url;

    tempImg.onload = () => {
        let canvas = document.createElement('canvas');
        canvas.width = tempImg.width;
        canvas.height = tempImg.height;


        let ctx = canvas.getContext('2d');
        ctx.drawImage(tempImg, 0, 0);


        if (palImageChanged) {
            showResizeOptions();
            palImageChanged = false;
            $('#resizeXRange').attr('max', canvas.width * 2);
            $('#resizeYRange').attr('max', canvas.height * 2);
            $('#resizeXInput,#resizeXRange').val(canvas.width);
            $('#resizeYInput,#resizeYRange').val(canvas.height);
            $('#resizeXInput').data('ar', canvas.width / canvas.height);

            $('#resizeAA').prop('checked', false);
            $('#tryResizePixelArt').prop('checked', false);
        } else {
            let resizeWidth, resizeHeight;
            let withAA = $('#resizeAA').is(':checked');

            if ($('#tryResizePixelArt').is(':checked')) {
                const { result, pixelSize } = (0,_resize__WEBPACK_IMPORTED_MODULE_13__.isImagePixelArt)(canvas);
                if (!result) {
                    toastr.warning((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('warn.notPixelArt'));
                } else {
                    resizeWidth = canvas.width / pixelSize;
                    resizeHeight = canvas.height / pixelSize;
                    withAA = false;
                }
            }

            if (!resizeWidth || !resizeHeight) {
                resizeWidth = $('#resizeXInput').val();
                resizeHeight = $('#resizeYInput').val();
            }


            canvas = (0,_resize__WEBPACK_IMPORTED_MODULE_13__.resizeCanvas)(canvas, resizeWidth, resizeHeight, withAA);
            ctx = canvas.getContext('2d');
        }

        tempImg = null;

        try {
            var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch (e) {
            return toastr.error((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('Image is loaded, but pixels can not be shown. Try to load it on Imgur or download->upload from file'))
        }

        const contrast = +$('#colorAdj').val();
        const brightness = +$('#brightAdj').val();
        imgData = clrManip.adjustGamma(imgData, contrast, brightness);

        const doNotConvert = $('#doNotConvert').is(':checked');

        if (doNotConvert) {
            ctx.putImageData(imgData, 0, 0);

            onDone(canvas, 'palOut',
                () => {
                    toastr.info((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('onDone.didNotConvert'));
                });
            return;
        }

        palUtils.updatePalette();

        let convGen; // converterGenerator
        switch ($('#ditheringMode').val()) {
            case 'none':
                convGen = palUtils.errorDithering(imgData);
                break;
            case 'f-s':
                convGen = palUtils.errorDithering(imgData, palUtils.ditherTypes.floydSteinberg);
                //convGen = palUtils.floydSteinberg(imgData, palUtils.ditherTypes.floydSteinberg);
                break;
            case 'stuki':
                convGen = palUtils.errorDithering(imgData, palUtils.ditherTypes.stuki);
                break;
            case 'check':
                convGen = palUtils.checkboardDithering(imgData);
                break;
            case 'sierra':
                convGen = palUtils.errorDithering(imgData, palUtils.ditherTypes.sierraTwo);
                break;
            case 'sierra-lite':
                convGen = palUtils.errorDithering(imgData, palUtils.ditherTypes.sierraLite);
                break;
            case 'ordered':
                var matrix = $('#ordMatrixSelect').val();
                var mode = $('#ordMatrixModeSelect').val();

                if (mode == 'des') mode = 0;
                else if (mode == 'asc') mode = 1;
                else mode = 2;

                var custom = false;
                if (matrix.startsWith('c')) {
                    custom = true;
                    matrix = matrix.slice(1);
                }
                convGen = palUtils.orderedDithering(imgData, +matrix, custom, mode);
                break;
            default:
                toastr.warning('O_o');
                return;
        }

        palUtils.usedColors = [];

        let startTime = Date.now();
        const progressBar = $('#palLB>.barProgress');
        progressBar.parent().parent().removeClass('opaque');
        palUtils.converterInterval = setImmediate(function rec() {
            let loaded = convGen.next();

            if (loaded.done) {
                progressBar.parent().parent().addClass('opaque');
                progressBar.css('width', 0);
                ctx.putImageData(imgData, 0, 0);
                onDone(canvas, 'palOut',
                    () => {
                        toastr.info(`${(0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('Done in')} ${(Date.now() - startTime) / 1000}${(0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('s.')}`);
                    });
            } else {
                let perc = loaded.value * 100;
                if (perc > 97) perc = 100;
                progressBar.css('width', perc + '%');
                palUtils.converterInterval = setImmediate(rec);
            }
        });
    }

    tempImg.onerror = () => {
        toastr.error('Unknown image loading error. Maybe CORS, so try to upload on Imgur')
    }
}

$('#palThresold').on('change', () => {
    palUtils.ditherPalette();
    converterPreload();
});
$('#colorAdj').on('input', (e) => {
    $('#colorAdjLabel').text(e.target.value);
});
$('#resetContrast').on('click', () => {
    $('#colorAdj').val(0);
    $('#colorAdjLabel').text(0);
});

$('#brightAdj').on('input', (e) => {
    $('#brightAdjLabel').text(e.target.value);
});
$('#resetBrightness').click(() => {
    $('#brightAdj').val(0);
    $('#brightAdjLabel').text(0);
});
document.onkeydown = e => {
    if (e.key === 'Enter' && !e.repeat) {
        converterPreload();
    }
}

// -----------------------------------------------
// -----------------------------------------------
// -----------------------------------------------
// -----------------------------------------------
// -----------------------------------------------

let patUtils = {
    patterns: importedPatterns.patterns,
    defaultPattern: importedPatterns.defaultPattern,
    patternSize: Math.sqrt(importedPatterns.patterns[0].length),

    usedColors: [],

    patternsCans: [], // список картинок с паттернами для ускоренного рисования
    generatePatterns() {
        this.patternsCans = [];
        const patternSize = this.patternSize;
        let pattern, ctx, color;
        for (let i = 0; i < paletteRGB.length; i++) {
            let canvas = document.createElement('canvas');
            canvas.width = canvas.height = patternSize;

            pattern = this.patterns[i % this.patterns.length];
            color = paletteRGB[i];

            ctx = canvas.getContext('2d');

            ctx.fillStyle = `rgb(${color.join(',')})`;

            for (let j = 0; j < pattern.length; j++) {
                if (!pattern[j]) continue;

                const x = j % patternSize,
                    y = j / patternSize | 0;

                ctx.fillRect(x, y, 1, 1);
            }

            this.patternsCans.push(canvas);
        }
    },
    drawPattern(ctx, pattern, startX, startY, color) {
        let s = this.patternSize;
        ctx.fillStyle = `rgb(${color.join(',')})`;
        for (let x = 0; x < s; x++) {
            for (let y = 0; y < s; y++) {
                if (!pattern[x + y * s]) continue
                ctx.fillRect(startX + x, startY + y, 1, 1);
            }
        }
    },
    // todo расширяемые паттерны
    * patternize(canvas) {
        const ctx = canvas.getContext('2d');
        const {
            data: imgData,
            width, height
        } = ctx.getImageData(0, 0, canvas.width, canvas.height);

        this.generatePatterns();

        const patternSize = this.patternSize;
        const patternLength = patternSize ** 2;

        const newWidth = width * patternSize;
        const newHeight = height * patternSize;

        let newCanvas = document.createElement('canvas');
        newCanvas.width = newWidth;
        newCanvas.height = newHeight;

        const ctx2 = newCanvas.getContext('2d');

        // actual palette32 includes opacity, i don't need it
        let palette32 = paletteRGB.map(c => (c[0] << 16) + (c[1] << 8) + c[2])
        let colorMap = new Map();
        palette32.forEach((el, i) => colorMap.set(el, i))

        let imgX, imgY, absX, absY, color, colId, color32, _i, pattern;
        for (let i = 0; i < imgData.length; i += 4) {
            if (imgData[i + 3] < 127) continue;

            _i = i / 4;
            imgX = _i % width;
            imgY = _i / width | 0;

            absX = imgX * patternSize;
            absY = imgY * patternSize;

            color = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];
            color32 = (color[0] << 16) + (color[1] << 8) + color[2];

            colId = colorMap.get(color32);

            pattern = this.patternsCans[colId];

            if (pattern) {
                ctx2.drawImage(pattern, absX, absY);
            } else {
                this.drawPattern(ctx2, this.defaultPattern, absX, absY, color)
            }

            if (i % 8000 === 0) {
                yield i / imgData.length
            }
        }
        //newCanvas.getContext('2d').putImageData(newImgData, 0, 0);

        return newCanvas;
    }
}

$('#patFolder').on('click', () => {
    ;(0,_openImage__WEBPACK_IMPORTED_MODULE_9__["default"])(dataURL => {
        $('#patInput').val((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('[file]'));
        $('#patInput').data('source', 'dataURL');

        patUtils.dataURL = dataURL;

        patternPreload();
    })
})

$('#patGOBtn').on('click', () => {
    patternPreload();
});

$('#patInput').on('keydown', (e) => {
    $('#patInput').data('source', 'url');
    if (e.code === 'Enter') {
        patternPreload();
    }
});

$('#patInput').on('paste', (e) => {
    let files = e.originalEvent.clipboardData.items;
    let images = [];
    for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image')) {
            images.push(files[i].getAsFile());
        };
    }
    if (!images.length) return;
    e.preventDefault();

    let image = images[0];

    const reader = new FileReader();
    reader.onload = function (ev) {
        $('#patInput').val((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('[clipboard]'));
        $('#patInput').data('source', 'dataURL');

        const tempImage = new Image();
        tempImage.onload = function () {
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = tempImage.width;
            tempCanvas.height = tempImage.height;
            const clipCtx = tempCanvas.getContext("2d");
            clipCtx.drawImage(tempImage, 0, 0);
            patUtils.dataURL = tempCanvas.toDataURL("image/png");
            patternPreload();
        };
        tempImage.src = ev.target.result;
    };
    reader.readAsDataURL(image);
})

function patternPreload() {
    let path = $('#patInput').val();
    if ($('#patInput').data('source') !== 'dataURL') {
        if (!path.length) {
            return toastr.error((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('Choose a image!'));
        }

        if (utils.isURLValid(path) && utils.isURLImage(path)) {
            palUtils.link = path;
            patternatorStart(path);
        } else {
            return toastr.error((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('Invalid link!'));
        }
    } else {
        patternatorStart(patUtils.dataURL);
    }
}

function patternatorStart(url) {
    clearImmediate(patUtils.converterInterval);

    let tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    tempImg.src = url;

    tempImg.onload = () => {
        let canvas = document.createElement('canvas');
        canvas.width = tempImg.width;
        canvas.height = tempImg.height;

        if (canvas.width > 800 || canvas.height > 800) {
            //toastr.warning('Image is wider than 800px, this can crash the page');
        }

        let ctx = canvas.getContext('2d');
        ctx.drawImage(tempImg, 0, 0);

        try {
            ctx.getImageData(0, 0, 1, 1);
        } catch (e) {
            return toastr.error((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('Image is loaded, but pixels can not be gotten. Try to load it on Imgur or download->upload from file'))
        }

        toastr.warning((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('If your image is big, go make a tea and watch Doctor Who'));
        let convGen = patUtils.patternize(canvas);

        let startTime = Date.now();
        patUtils.converterInterval = setImmediate(function rec() {
            let loaded = convGen.next();

            if (loaded.done) {
                onDone(loaded.value, 'patOut',
                    () => {
                        toastr.info(`${(0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('Done in')} ${(Date.now() - startTime) / 1000}s.`);
                    });
            } else {
                patUtils.converterInterval = setImmediate(rec);
            }
        });
    }

    tempImg.onerror = () => {
        toastr.error((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('Unknown image loading error. Maybe CORS, so try to upload on Imgur'))
    }
}

function createImgData(width, height) {
    let tempCanvas = document.createElement('canvas');

    let newImgData = tempCanvas.getContext('2d').createImageData(width, height);
    tempCanvas = null;

    return newImgData
}

async function copyCanvasToClipboard(canvas) {
    const blob = await new Promise(res => canvas.toBlob(res));
    const item = new ClipboardItem({ "image/png": blob });
    navigator.clipboard.write([item]);
}

async function copyToClipboard(text) {
    await navigator.clipboard.writeText(text);
}

function downloadCanvas(canvas) {
    const link = document.createElement('a');
    link.download = 'filename.png';
    link.href = canvas.toDataURL()
    link.click();
}

async function showUploadPrompt(palettizedCanvas) {
    return new Promise((res, rej) => {
        try {
            const prompt = $('<div class="upload-prompt"></div>');
            const thumbCanvas = document.createElement('canvas');
            const thumbCtx = thumbCanvas.getContext('2d');

            let thumbWidth, thumbHeight;
            if (palettizedCanvas.width > palettizedCanvas.height) {
                thumbWidth = 50;
                thumbHeight = Math.round((palettizedCanvas.height / palettizedCanvas.width) * 50);
            } else {
                thumbHeight = 50;
                thumbWidth = Math.round((palettizedCanvas.width / palettizedCanvas.height) * 50);
            }

            thumbCanvas.width = 50;
            thumbCanvas.height = 50;

            thumbCtx.clearRect(0, 0, 50, 50);
            thumbCtx.drawImage(
                palettizedCanvas,
                (50 - thumbWidth) / 2,
                (50 - thumbHeight) / 2,
                thumbWidth,
                thumbHeight
            );

            const thumbImg = $('<img>').attr('src', thumbCanvas.toDataURL());


            const namesSelect = $(`<select style="margin-right: 3px;"/>`)
                .addClass('template-names');

            const nameInput = $(`<input type="text" placeholder="${(0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('template_name_desc')}">`)
                .addClass('template-name');

            const namesContainer = $('<div/>');
            namesContainer.append(namesSelect, nameInput);

            const patternContainer = $('<div class="checkbox-container"></div>');
            const patternCheckbox = $('<input type="checkbox" id="convertToPattern" checked>')
                .addClass('pattern-checkbox');
            const patternLabel = $(`<label for="convertToPattern">${(0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('template_patternize')}</label>`);
            patternContainer.append(patternCheckbox, patternLabel);

            const publicContainer = $('<div class="checkbox-container"></div>');
            const publicCheckbox = $('<input type="checkbox" id="isPublicTemplate">')
                .addClass('public-checkbox');
            const publicLabel = $(`<label for="isPublicTemplate">${(0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('template_is_public')}</label>`);
            publicContainer.append(publicCheckbox, publicLabel);

            const confirmButton = $(`<button>${(0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('upload_to_goroxels')}</button>`).addClass('confirm-upload');
            prompt.append(thumbImg, namesContainer, patternContainer, publicContainer, confirmButton);
            $('body').append(prompt);

            async function onclick() {
                const templateName = nameInput.val().trim();
                if (templateName.length < 3 || templateName.length > 32) {
                    toastr.error((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('template_name_shit'));
                    return;
                }

                try {
                    const formData = new FormData();
                    const thumbBlob = await new Promise((resolve, reject) => {
                        thumbCanvas.toBlob(b => b ? resolve(b) : reject(new Error("Failed to create thumbnail")), 'image/png');
                    });
                    formData.append('thumb', thumbBlob, 'thumbnail.png');

                    let patternCanvas = palettizedCanvas, patternized = false;
                    if (patternCheckbox.is(':checked')) {
                        if (!patUtils || typeof patUtils.patternize !== "function") {
                            throw new Error("Patternize utility not available");
                        }

                        let toast = toastr.info(`(0%)`, "PATTERN", {
                            timeOut: 0,
                            extendedTimeOut: 0,
                            closeButton: true,
                            tapToDismiss: false
                        });

                        patternized = true;

                        const patternGen = patUtils.patternize(palettizedCanvas);
                        let patternResult;
                        while (!(patternResult = patternGen.next()).done) {
                            await (0,_utils_misc__WEBPACK_IMPORTED_MODULE_15__.sleep)(0);
                            if (toast && toast.find('.toast-message').length) {
                                toast.find('.toast-message').text(`${(patternResult.value * 100) | 0}%`);
                            }
                        }
                        toast.remove();

                        patternCanvas = patternResult.value;
                    }

                    const patternBlob = await new Promise((resolve, reject) => {
                        patternCanvas.toBlob(b => b ? resolve(b) : reject(new Error("Failed to create pattern")), 'image/png');
                    });
                    formData.append('pattern', patternBlob, 'pattern.png');

                    const isPublic = publicCheckbox.is(':checked');
                    const origWidth = patternized ? palettizedCanvas.width : '';
                    const url = `/api/template/add?name=${encodeURIComponent(templateName)}&public=${isPublic}&width=${origWidth}`;

                    const response = await fetch(url, {
                        method: 'POST',
                        body: formData,
                        credentials: 'include'
                    });

                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const result = await response.json();

                    if (result.errors) {
                        (0,_utils_api__WEBPACK_IMPORTED_MODULE_12__.processApiErrors)(result.errors);
                        return;
                    }

                    toastr.success('Template uploaded successfully!');
                    prompt.remove();
                    res(result);

                } catch (error) {
                    toastr.error('Upload failed: ' + error.message);
                    rej(error);
                }
            }

            confirmButton.on('click', onclick);

            fetch(`/api/template/list?self=1`, {
                credentials: 'include'
            }).then(async response => {
                const result = await response.json();

                if (result.errors) {
                    (0,_utils_api__WEBPACK_IMPORTED_MODULE_12__.processApiErrors)(result.errors);
                    return;
                }

                const templates = result;

                for(const template of templates){
                    const option = $(`<option value="${template.name}">${template.name}</option>`);
                    namesSelect.append(option);
                }

                namesSelect.on('change', () => {
                    nameInput.val(namesSelect.val());
                })
            }).catch(toastr.error);

        } catch (err) {
            rej(err);
        }
    });
}


function onDone(canvas, convClass, callback) {
    $(`#${convClass} > *`).remove();

    canvas.className = 'outputImg';

    const zoomChecked = $('#autoZoom')[0].checked;

    let newImg = document.createElement('img');
    newImg.className = 'outputImg' + (zoomChecked ? ' zoomed' : '');
    newImg.src = canvas.toDataURL();
    if (!zoomChecked) newImg.style.width = Math.min(canvas.width, parseInt($(`#${convClass}`).css('width')) / 2) + 'px';

    $(`#${convClass}`)[0].appendChild(newImg);

    $(`#${convClass}`).append(
        `<div class="afterImage">
            <div class="line"><button class="uploadButton"> ${(0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('Upload on imgur!')}</button></div>
            ${convClass === 'palOut' ? `<div class="line"><button class="uploadGrokselsButton">${(0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('upload_to_goroxels')}</button></div>` : ''}
            <div class="line"><span class="uploadedUrl"></span></div>
            ${convClass === 'patOut' ? `<div class="line">${(0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('Final image size:')} ${canvas.width}x${canvas.height}</div>` : ''}
            <div class="line"><button class="copyToClipButton">${(0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('copy_canvas_btn')}</button></div>
            <div class="line"><button class="downloadButton">${(0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('download_canvas_btn')}</button></div>
        </div>`
    );
    _imgzoom__WEBPACK_IMPORTED_MODULE_8___default().createZoomHandler($(`#${convClass}`).children(0)[0]);

    $(`#${convClass} .uploadButton`).one('click', async () => {
        $(`#${convClass} .uploadedUrl`).text('Uploading...');

        try {
            const link = await (0,_imgur__WEBPACK_IMPORTED_MODULE_10__.upload)(canvas.toDataURL().split(",")[1]);
            const isPNG = link.endsWith('png');
            if (!isPNG) {
                toastr.warn('JPEG!!!');
                throw new Error;
            }

            $(`#${convClass} .uploadedUrl`).html(
                `<span style="color:rgb(0, 190, 0)">${link}${convClass === 'patOut' ? `?width=${canvas.width / 7}` : ''}</span>`
            )
        } catch {
            const text = (0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('Imgur upload failed, try upload manually');
            let html;
            if (convClass === 'patOut') {
                html = `${text}<br><input id="patternLinkGenerator" placeholder="${(0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('insert_link_here')}">&nbsp;<span id="patternLink"></span>`;
                setTimeout(() => {
                    const span = $('#patternLink');
                    $('#patternLinkGenerator').on('input', e => {
                        const input = e.target;
                        let link = input.value;
                        input.style.backgroundColor = '';

                        if (link.includes('imgur') && !link.endsWith('.png')) {
                            if (link.includes('/a/')) {
                                input.style.backgroundColor = 'red';
                                return span.text((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('imgur_album_link'))
                            }

                            link += '.png';
                        }

                        link += `?width=${canvas.width / 7}`;

                        span.text(link);
                    })
                })
            } else {
                html = text;
            }

            $(`#${convClass} .uploadedUrl`).html(html)
        }
    });

    $(`#${convClass} .copyToClipButton`).one('click', () => {
        copyCanvasToClipboard(canvas)
            .then(() => toastr.success((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('img_copied_success')));
    });

    $(`#${convClass} .downloadButton`).one('click', () => {
        downloadCanvas(canvas)
    });

    if (convClass === 'palOut') {
        $(`#${convClass} .uploadGrokselsButton`).one('click', () => {
            showUploadPrompt(canvas).then(template => {
                if (template === null || template === undefined) {
                    return;
                }
                const filePath = template.file;
                $(`#${convClass} .uploadedUrl`).text(`GRX/?f=${filePath}&w=${canvas.width}`);
            });
        });
    }

    $(`#${convClass} .uploadedUrl`).on('click', (e) => {
        copyToClipboard(e.target.innerText).then(() => toastr.success((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('conv.url_copied_success')));
    });

    callback();
}

$('#aspectRatioLock').on('click', e => {
    const btn = e.target;
    if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        resizeKeepAspectRatio = false;
    } else {
        btn.classList.add('active');
        resizeKeepAspectRatio = true;
    }
})

function showResizeOptions() {
    $('#resizeXInput,#resizeYInput').parent().removeClass('hidden');
}

// listeners to keep aspect ratio
$('#resizeXInput,#resizeXRange').on('input', e => {
    // to prevent infinite cycle of input events
    if (!e.originalEvent?.isTrusted || !resizeKeepAspectRatio) return;
    const newWidth = e.target.value

    const ar = parseFloat($('#resizeXInput').data('ar'));
    const newHeight = Math.floor(newWidth / ar);
    $('#resizeYInput,#resizeYRange').val(newHeight);
});
$('#resizeYInput,#resizeYRange').on('input', e => {
    if (!e.originalEvent?.isTrusted || !resizeKeepAspectRatio) return;
    const newHeight = e.target.value

    const ar = parseFloat($('#resizeXInput').data('ar'));
    const newWidth = Math.floor(newHeight * ar);
    $('#resizeXInput,#resizeXRange').val(newWidth);
});



let palName;
(0,_palettes__WEBPACK_IMPORTED_MODULE_5__.loadGamePalettes)().then(() => {
    palName = 'game.main'
}).catch(() => {
    toastr.error((0,_translate__WEBPACK_IMPORTED_MODULE_11__.translate)('Failed to load game palettes!'));
    palName = 'pixelplanet'
}).finally(() => {
    applyPalettes(palName);
    paletteRGB = _palettes__WEBPACK_IMPORTED_MODULE_5__["default"][palName];

    palUtils.updatePalette();
    visualizePalette();
});

/***/ }),

/***/ "./src/js/convert/openImage.js":
/*!*************************************!*\
  !*** ./src/js/convert/openImage.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// https://stackoverflow.com/questions/3582671/how-to-open-a-local-disk-file-with-javascript
// copied and edited

function clickElem(elem) {
    // Thx user1601638 on Stack Overflow (6/6/2018 - https://stackoverflow.com/questions/13405129/javascript-create-and-save-file )
    var eventMouse = document.createEvent("MouseEvents")
    eventMouse.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    elem.dispatchEvent(eventMouse)
}

function openImage(callback) {
    const readFile = function (e) {
        document.body.removeChild(fileInput);

        var file = e.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function () {
            callback(reader.result);
        }
        reader.readAsDataURL(file);
    }
    const fileInput = document.createElement("input");
    fileInput.type = 'file';
    fileInput.accept = 'image/png';
    fileInput.style.display = 'none';
    fileInput.onchange = readFile;
    document.body.appendChild(fileInput);
    clickElem(fileInput);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (openImage);

/***/ }),

/***/ "./src/js/convert/palettes.js":
/*!************************************!*\
  !*** ./src/js/convert/palettes.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   loadGamePalettes: () => (/* binding */ loadGamePalettes)
/* harmony export */ });
/* provided dependency */ var toastr = __webpack_require__(/*! toastr */ "./node_modules/toastr/toastr.js");
let palettes = {
    pixelzone: [
        [38, 38, 38],
        [0, 0, 0],
        [128, 128, 128],
        [255, 255, 255],
        [153, 98, 61],
        [255, 163, 200],
        [207, 115, 230],
        [128, 0, 128],
        [229, 0, 0],
        [229, 137, 0],
        [229, 229, 0],
        [150, 230, 70],
        [0, 190, 0],
        [0, 230, 230],
        [0, 136, 204],
        [0, 0, 230]
    ],
    pixelplanet: [
        [255, 255, 255],
        [228, 228, 228],
        [196, 196, 196],
        [136, 136, 136],
        [78, 78, 78],
        [0, 0, 0],
        [244, 179, 174],
        [255, 167, 209],
        [255, 84, 178],
        [255, 101, 101],
        [229, 0, 0],
        [154, 0, 0],
        [254, 164, 96],
        [229, 149, 0],
        [160, 106, 66],
        [96, 64, 40],
        [245, 223, 176],
        [255, 248, 137],
        [229, 217, 0],
        [148, 224, 68],
        [2, 190, 1],
        [104, 131, 56],
        [0, 101, 19],
        [202, 227, 255],
        [0, 211, 221],
        [0, 131, 199],
        [0, 0, 234],
        [25, 25, 115],
        [207, 110, 228],
        [130, 0, 128],
    ],
    pixelplace: [
        [255, 255, 255],
        [196, 196, 196],
        [136, 136, 136],
        [34, 34, 34],
        [255, 167, 209],
        [229, 0, 0],
        [229, 149, 0],
        [160, 106, 66],
        [229, 217, 0],
        [148, 224, 68],
        [2, 190, 1],
        [0, 211, 221],
        [0, 131, 199],
        [0, 0, 234],
        [207, 110, 228],
        [130, 0, 128],
        [255, 223, 204],
        [85, 85, 85],
        [0, 0, 0],
        [236, 8, 236],
        [107, 0, 0],
        [255, 57, 4],
        [99, 60, 31],
        [81, 225, 25],
        [0, 102, 0],
        [54, 186, 255],
        [4, 75, 255]
    ],
    wplaceFree: [[0,0,0],[60,60,60],[120,120,120],[210,210,210],[255,255,255],[96,0,24],[237,28,36],[255,127,39],[246,170,9],[249,221,59],[255,250,188],[14,185,104],[19,230,123],[135,255,94],[12,129,110],[16,174,166],[19,225,190],[40,80,158],[64,147,228],[96,247,242],[107,80,246],[153,177,251],[120,12,153],[170,56,185],[224,159,249],[203,0,122],[236,31,128],[243,141,169],[104,70,52],[149,104,42],[248,178,119]],
    wplacePremium: [[0,0,0],[60,60,60],[120,120,120],[210,210,210],[255,255,255],[96,0,24],[237,28,36],[255,127,39],[246,170,9],[249,221,59],[255,250,188],[14,185,104],[19,230,123],[135,255,94],[12,129,110],[16,174,166],[19,225,190],[40,80,158],[64,147,228],[96,247,242],[107,80,246],[153,177,251],[120,12,153],[170,56,185],[224,159,249],[203,0,122],[236,31,128],[243,141,169],[104,70,52],[149,104,42],[248,178,119],[170,170,170],[165,14,30],[250,128,114],[228,92,26],[214,181,148],[156,132,49],[197,173,49],[232,212,95],[74,107,58],[90,148,74],[132,197,115],[15,121,159],[187,250,242],[125,199,255],[77,49,184],[74,66,132],[122,113,196],[181,174,241],[219,164,99],[209,128,81],[255,197,165],[155,82,73],[209,128,120],[250,182,164],[123,99,82],[156,132,107],[51,57,65],[109,117,141],[179,185,209],[109,100,63],[148,140,107],[205,197,158]]
};

async function loadConfig(){
    const resp = await fetch('/config.json');
    return await resp.json();
}

async function loadGamePalettes(){
    try{
        const config = await loadConfig();
        config.canvases.forEach(canvas => {
            palettes['game.' + canvas.name] = canvas.palette;
        });
    }catch(e){
        toastr.warning('Failed to load game palettes')
    }
}


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (palettes);

/***/ }),

/***/ "./src/js/convert/resize.js":
/*!**********************************!*\
  !*** ./src/js/convert/resize.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isImagePixelArt: () => (/* binding */ isImagePixelArt),
/* harmony export */   resizeCanvas: () => (/* binding */ resizeCanvas)
/* harmony export */ });
function resizeCanvas(canvas, width, height, antiAliasing = true) {
    width = Math.max(0, Math.floor(Number(width) || 0));
    height = Math.max(0, Math.floor(Number(height) || 0));
    const dpr = window.devicePixelRatio || 1;
    const targetRatio = antiAliasing ? dpr : 1;

    const prevW = canvas.width;
    const prevH = canvas.height;

    const copyCanvas = document.createElement("canvas");
    copyCanvas.width = Math.max(1, prevW);
    copyCanvas.height = Math.max(1, prevH);
    const copyCtx = copyCanvas.getContext("2d");
    if (prevW && prevH) {
        copyCtx.drawImage(canvas, 0, 0);
    }

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = Math.max(1, Math.round(width * targetRatio));
    canvas.height = Math.max(1, Math.round(height * targetRatio));

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = !!antiAliasing;
    if ("imageSmoothingQuality" in ctx) {
        ctx.imageSmoothingQuality = antiAliasing ? "high" : "low";
    }
    ctx.setTransform(targetRatio, 0, 0, targetRatio, 0, 0);

    if (prevW && prevH) {
        ctx.drawImage(copyCanvas, 0, 0, copyCanvas.width, copyCanvas.height,
            0, 0, width, height);
    }
    return ctx.canvas;
}

// searches for pixel chunks and automatically
// determines them zoom
function isImagePixelArt(canvas) {
    const ctx = canvas.getContext("2d");
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;

    const maxSize = 10;
    let supposedSize = 0;
    let confirms = 0;
    const maxBound = Math.min(img.width, img.height);

    let curSize = 0;
    let lastSize = 0;
    let lastSizeCombos = 0;
    let lastCol = -1;

    let result = false;
    let pixelSize = 1;

    const encodeClr = (r, g, b) => (r << 16) | (g << 8) | b;

    for (let diagonale = 0; diagonale < maxBound; diagonale++) {
        const idx = (diagonale + diagonale * img.width) * 4;
        const curCol = encodeClr(d[idx], d[idx + 1], d[idx + 2]);

        curSize += 1;

        if (curCol !== lastCol) {
            lastCol = curCol;

            if (curSize === lastSize && lastSize > 0) {
                lastSizeCombos++;

                if (lastSizeCombos >= 1) {
                    if (confirms > 0) {
                        if (confirms >= 1) {
                            result = true;
                            pixelSize = supposedSize;
                            return { result, pixelSize };
                        } else {
                            const div = img.width % supposedSize;
                            if (supposedSize !== lastSize || div !== 0) {
                                return { result: false, pixelSize: 1 };
                            }
                        }
                    }

                    lastSizeCombos = 0;
                    confirms++;
                    supposedSize = lastSize;
                    lastSize = 0;
                }
            } else {
                if (
                    curSize < maxSize &&
                    curSize > 1 &&
                    (curSize < lastSize * 2 || lastSize === 0)
                ) {
                    lastSize = curSize;
                }
                if (lastSize && curSize === 1) {
                    return { result: false, pixelSize: 1 };
                }
            }

            curSize = 0;
        }
    }

    return { result: false, pixelSize: 1 };
}


/***/ }),

/***/ "./src/js/convert/setImmediate.js":
/*!****************************************!*\
  !*** ./src/js/convert/setImmediate.js ***!
  \****************************************/
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof __webpack_require__.g === "undefined" ? this : __webpack_require__.g : self));

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/amd define */
/******/ 	(() => {
/******/ 		__webpack_require__.amdD = function () {
/******/ 			throw new Error('define cannot be used indirect');
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/amd options */
/******/ 	(() => {
/******/ 		__webpack_require__.amdO = {};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/harmony module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.hmd = (module) => {
/******/ 			module = Object.create(module);
/******/ 			if (!module.children) module.children = [];
/******/ 			Object.defineProperty(module, 'exports', {
/******/ 				enumerable: true,
/******/ 				set: () => {
/******/ 					throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
/******/ 				}
/******/ 			});
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = ".";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"converters": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkgoroxels_client"] = self["webpackChunkgoroxels_client"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors","penis"], () => (__webpack_require__("./src/js/convert/main.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=converters.ff9f2f6f5da953eca374.bundle.js.map