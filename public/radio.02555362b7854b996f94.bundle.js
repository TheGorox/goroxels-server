/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/radio/main.js":
/*!******************************!*\
  !*** ./src/js/radio/main.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var toastr = __webpack_require__(/*! toastr */ "./node_modules/toastr/toastr.js");
let userRole;

        async function fetchRole() {
            try {
                const response = await fetch('/api/me');
                const data = await response.json();
                return data.role;
            } catch (error) {
                console.error('Error fetching role:', error);
                return 0; // Default to guest on error
            }
        }

        async function loadSongs() {
            // Assuming GET /songs endpoint exists returning {songs: ['title1', 'title2', ...]}
            // If not, this would need server-side implementation
            try {
                const response = await fetch('/api/radio/get-queue?limit=9999');
                const data = await response.json();
                const songList = document.getElementById('song-list');
                songList.innerHTML = '';
                const allSongs = [...data.queues.queue, ...data.queues.defaultQueue];
                allSongs.forEach(({title}) => {
                    const card = document.createElement('div');
                    card.className = 'song-card';
                    card.innerHTML = `<h3>${title}</h3>`;
                    card.onclick = () => showSongInfo(title);

                    const actions = document.createElement('div');
                    actions.className = 'song-actions';

                    if (userRole >= 3) {
                        const enqueueBtn = document.createElement('button');
                        enqueueBtn.textContent = 'Enqueue';
                        enqueueBtn.onclick = (e) => { e.stopPropagation(); enqueueSong(title); };
                        actions.appendChild(enqueueBtn);
                    }

                    if (userRole >= 4) {
                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = 'Delete';
                        deleteBtn.onclick = (e) => { e.stopPropagation(); deleteSong(title); };
                        actions.appendChild(deleteBtn);
                    }

                    card.appendChild(actions);
                    songList.appendChild(card);
                });
            } catch (error) {
                console.error('Error loading songs:', error);
                document.getElementById('song-list').innerHTML = '<p>Error loading songs. Please try again.</p>';
            }
        }

        function showSongInfo(title) {
            // Basic info display; extend with metadata if endpoint available
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-info').textContent = `Details for "${title}". (Metadata like duration/artist not available via API.)`;
            document.getElementById('modal').style.display = 'flex';
        }

        function closeModal() {
            document.getElementById('modal').style.display = 'none';
        }

        window.addTempSong = async function addTempSong() {
            const file = document.getElementById('temp-file').files[0];
            const name = document.getElementById('temp-name').value || file.name;
            if (!name || !file) return toastr.info('Name and file required.');

            const formData = new FormData();
            formData.append('name', name);
            formData.append('data', file);

            try {
                const response = await fetch('/api/radio/gateway/add-temp-song', { method: 'POST', body: formData });
                const data = await response.json();
                if (!data.error) {
                    toastr.info('Song added to one-time queue.');
                    loadSongs();
                } else {
                    toastr.error(data.errorText || 'Error adding song.');
                }
            } catch (error) {
                toastr.info('Unexpected error.');
            }
        }

        window.addPermSong = async function addPermSong() {
            const file = document.getElementById('perm-file').files[0];
            const name = document.getElementById('perm-name').value || file?.name;
            const enqueue = document.getElementById('enqueue-check').checked ? 1 : 0;
            if (!name || !file) return toastr.info('Name and file required.');

            const formData = new FormData();
            formData.append('name', name);
            formData.append('enqueue', enqueue);
            formData.append('data', file);

            try {
                const response = await fetch('/api/radio/gateway/add-song', { method: 'POST', body: formData });
                const data = await response.json();
                if (!data.error) {
                    toastr.info('Song added.');
                    loadSongs();
                } else {
                    toastr.info(data.errorText || 'Error adding song.');
                }
            } catch (error) {
                toastr.info('Unexpected error.');
            }
        }

        window.skipSong = async function skipSong() {
            try {
                const response = await fetch('/api/radio/gateway/skip-song');
                const data = await response.json();
                if (!data.error) {
                    toastr.info('Song skipped.');
                } else {
                    toastr.info(data.errorText || 'Error skipping song.');
                }
            } catch (error) {
                toastr.info('Unexpected error.');
            }
        }

        async function enqueueSong(title) {
            try {
                const response = await fetch(`/api/radio/gateway/enqueue?title=${encodeURIComponent(title)}`, { method: 'POST' });
                const data = await response.json();
                if (!data.error) {
                    toastr.info('Song enqueued.');
                } else {
                    toastr.info(data.errorText || 'Error enqueuing song.');
                }
            } catch (error) {
                toastr.info('Unexpected error.');
            }
        }

        async function deleteSong(title) {
            if (!confirm(`Delete "${title}"?`)) return;
            try {
                const response = await fetch(`/api/radio/gateway/delete-song?title=${encodeURIComponent(title)}`, { method: 'POST' });
                const data = await response.json();
                if (!data.error) {
                    toastr.info('Song deleted.');
                    loadSongs();
                } else {
                    toastr.info(data.errorText || 'Error deleting song.');
                }
            } catch (error) {
                toastr.info('Unexpected error.');
            }
        }

        async function initialize() {
            userRole = await fetchRole();
            document.getElementById('role-info').textContent = `Your Role: ${userRole}`;

            if (userRole < 2) {
                document.body.innerHTML = '<h1>Access Denied</h1><p>You must be at least Trusted to access this page.</p>';
                return;
            }

            loadSongs();

            if (userRole >= 2) document.getElementById('add-temp-form').style.display = 'block';
            if (userRole >= 3) document.getElementById('add-perm-form').style.display = 'block';
            if (userRole >= 4) document.getElementById('skip-section').style.display = 'block';
        }

        initialize();

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
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"radio": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors"], () => (__webpack_require__("./src/js/radio/main.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=radio.02555362b7854b996f94.bundle.js.map