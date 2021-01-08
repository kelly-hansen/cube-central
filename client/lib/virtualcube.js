/* @(#)virtualcube.js 2017-01-13_2af0f20 2017-01-13
* Copyright (c) 2016 Werner Randelshofer, Switzerland.
* You may not use, copy or modify this file, except in compliance with the
* accompanying license terms.
*/

export default function virtualCube() {

  'use strict';
  {
    let requirejs, require, define;
    (function (undef) {
      let main; let req; let makeMap; let handlers;
      const defined = {};
      const waiting = {};
      let config = {};
      const defining = {};
      const hasOwn = Object.prototype.hasOwnProperty;
      const aps = [].slice;
      const jsSuffixRegExp = /\.js$/;
      function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
      }
      function normalize(name, baseName) {
        let nameParts; let nameSegment; let mapValue; let foundMap; let lastIndex;
        let foundI; let foundStarMap; let starI; let i; let j; let part; let normalizedBaseParts;
        const baseParts = baseName && baseName.split('/');
        const map = config.map;
        const starMap = (map && map['*']) || {};
        if (name) {
          name = name.split('/');
          lastIndex = name.length - 1;
          if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
            name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
          }
          if (name[0].charAt(0) === '.' && baseParts) {
            normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
            name = normalizedBaseParts.concat(name);
          }
          for (i = 0; i < name.length; i++) {
            part = name[i];
            if (part === '.') {
              name.splice(i, 1);
              i -= 1;
            } else if (part === '..') {
              if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
                continue;
              } else if (i > 0) {
                name.splice(i - 1, 2);
                i -= 2;
              }
            }
          }
          name = name.join('/');
        }
        if ((baseParts || starMap) && map) {
          nameParts = name.split('/');
          for (i = nameParts.length; i > 0; i -= 1) {
            nameSegment = nameParts.slice(0, i).join('/');
            if (baseParts) {
              for (j = baseParts.length; j > 0; j -= 1) {
                mapValue = map[baseParts.slice(0, j).join('/')];
                if (mapValue) {
                  mapValue = mapValue[nameSegment];
                  if (mapValue) {
                    foundMap = mapValue;
                    foundI = i;
                    break;
                  }
                }
              }
            }
            if (foundMap) {
              break;
            }
            if (!foundStarMap && starMap && starMap[nameSegment]) {
              foundStarMap = starMap[nameSegment];
              starI = i;
            }
          }
          if (!foundMap && foundStarMap) {
            foundMap = foundStarMap;
            foundI = starI;
          }
          if (foundMap) {
            nameParts.splice(0, foundI, foundMap);
            name = nameParts.join('/');
          }
        }
        return name;
      }
      function makeRequire(relName, forceSync) {
        return function () {
          const args = aps.call(arguments, 0);
          if (typeof args[0] !== 'string' && args.length === 1) {
            args.push(null);
          }
          return req.apply(undef, args.concat([relName, forceSync]));
        };
      }
      function makeNormalize(relName) {
        return function (name) {
          return normalize(name, relName);
        };
      }
      function makeLoad(depName) {
        return function (value) {
          defined[depName] = value;
        };
      }
      function callDep(name) {
        if (hasProp(waiting, name)) {
          const args = waiting[name];
          delete waiting[name];
          defining[name] = true;
          main.apply(undef, args);
        }
        if (!hasProp(defined, name) && !hasProp(defining, name)) {
          throw new Error('No ' + name);
        }
        return defined[name];
      }
      function splitPrefix(name) {
        let prefix;
        const index = name ? name.indexOf('!') : -1;
        if (index > -1) {
          prefix = name.substring(0, index);
          name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
      }
      function makeRelParts(relName) {
        return relName ? splitPrefix(relName) : [];
      }
      makeMap = function (name, relParts) {
        let plugin;
        let parts = splitPrefix(name);
        let prefix = parts[0];
        const relResourceName = relParts[1];
        name = parts[1];
        if (prefix) {
          prefix = normalize(prefix, relResourceName);
          plugin = callDep(prefix);
        }
        if (prefix) {
          if (plugin && plugin.normalize) {
            name = plugin.normalize(name, makeNormalize(relResourceName));
          } else {
            name = normalize(name, relResourceName);
          }
        } else {
          name = normalize(name, relResourceName);
          parts = splitPrefix(name);
          prefix = parts[0];
          name = parts[1];
          if (prefix) {
            plugin = callDep(prefix);
          }
        }
        return {
          f: prefix ? prefix + '!' + name : name,
          n: name,
          pr: prefix,
          p: plugin
        };
      };
      function makeConfig(name) {
        return function () {
          return (config && config.config && config.config[name]) || {};
        };
      }
      handlers = {
        require: function (name) {
          return makeRequire(name);
        },
        exports: function (name) {
          const e = defined[name];
          if (typeof e !== 'undefined') {
            return e;
          } else {
            return (defined[name] = {});
          }
        },
        module: function (name) {
          return {
            id: name,
            uri: '',
            exports: defined[name],
            config: makeConfig(name)
          };
        }
      };
      main = function (name, deps, callback, relName) {
        let cjsModule; let depName; let ret; let map; let i; let relParts;
        const args = [];
        const callbackType = typeof callback;
        let usingExports;
        relName = relName || name;
        relParts = makeRelParts(relName);
        if (callbackType === 'undefined' || callbackType === 'function') {
          deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
          for (i = 0; i < deps.length; i += 1) {
            map = makeMap(deps[i], relParts);
            depName = map.f;
            if (depName === 'require') {
              args[i] = handlers.require(name);
            } else if (depName === 'exports') {
              args[i] = handlers.exports(name);
              usingExports = true;
            } else if (depName === 'module') {
              cjsModule = args[i] = handlers.module(name);
            } else if (hasProp(defined, depName) ||
                            hasProp(waiting, depName) ||
                            hasProp(defining, depName)) {
              args[i] = callDep(depName);
            } else if (map.p) {
              map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
              args[i] = defined[depName];
            } else {
              throw new Error(name + ' missing ' + depName);
            }
          }
          ret = callback ? callback.apply(defined[name], args) : undefined;
          if (name) {
            if (cjsModule && cjsModule.exports !== undef &&
                          cjsModule.exports !== defined[name]) {
              defined[name] = cjsModule.exports;
            } else if (ret !== undef || !usingExports) {
              defined[name] = ret;
            }
          }
        } else if (name) {
          defined[name] = callback;
        }
      };
      requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === 'string') {
          if (handlers[deps]) {
            return handlers[deps](callback);
          }
          return callDep(makeMap(deps, makeRelParts(callback)).f);
        } else if (!deps.splice) {
          config = deps;
          if (config.deps) {
            req(config.deps, config.callback);
          }
          if (!callback) {
            return;
          }
          if (callback.splice) {
            deps = callback;
            callback = relName;
            relName = null;
          } else {
            deps = undef;
          }
        }
        callback = callback || function () {};
        if (typeof relName === 'function') {
          relName = forceSync;
          forceSync = alt;
        }
        if (forceSync) {
          main(undef, deps, callback, relName);
        } else {
          setTimeout(function () {
            main(undef, deps, callback, relName);
          }, 4);
        }
        return req;
      };
      req.config = function (cfg) {
        return req(cfg);
      };
      requirejs._defined = defined;
      define = function (name, deps, callback) {
        if (typeof name !== 'string') {
          throw new Error('See almond README: incorrect module build, no module name');
        }
        if (!deps.splice) {
          callback = deps;
          deps = [];
        }
        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
          waiting[name] = [name, deps, callback];
        }
      };
      define.amd = {
        jQuery: true
      };
    }());
    'use strict';
    define('AbstractCanvas', ['J3DI', 'J3DIMath', 'Node3D'],
      function (J3DI, J3DIMath, Node3D
      ) {
        const module = {
          log: (false) ? console.log : () => {},
          info: (true) ? console.info : () => {},
          warning: (true) ? console.warning : () => {},
          error: (true) ? console.error : () => {}
        };
        class AbstractCanvas {
          constructor() {
            this.canvas = null;
            this.willRepaint = false;
            this.repaintCallbacks = [];
            this.stickersTexture = null;
            this.handler = {
              onTouchStart: function (event) {},
              onTouchEnd: function (event) {},
              onTouchMove: function (event) {},
              onMouseDown: function (event) {},
              onMouseUp: function (event) {},
              onMouseMove: function (event) {}
            };
            const self = this;
            this.selectStartListener = function (event) {
              return false;
            };
            this.touchStartListener = function (event) {
              return self.handler.onTouchStart(event);
            };
            this.touchEndListener = function (event) {
              return self.handler.onTouchEnd(event);
            };
            this.touchMoveListener = function (event) {
              return self.handler.onTouchMove(event);
            };
            this.mouseDownListener = function (event) {
              return self.handler.onMouseDown(event);
            };
            this.mouseUpListener = function (event) {
              return self.handler.onMouseUp(event);
            };
            this.mouseMoveListener = function (event) {
              return self.handler.onMouseMove(event);
            };
          }

          setCanvas(canvas) {
            if (this.canvas != null) {
              this.canvas.removeEventListener('selectstart', this.selectStartListener);
              this.canvas.removeEventListener('mousedown', this.mouseDownListener);
              document.removeEventListener('mousemove', this.mouseMoveListener);
              document.removeEventListener('mouseup', this.mouseUpListener);
              this.canvas.removeEventListener('touchstart', this.touchStartListener);
              document.removeEventListener('touchmove', this.touchMoveListener);
              document.removeEventListener('touchend', this.touchEndListener);
              this.closeCanvas();
            }
            this.canvas = canvas;
            if (this.canvas != null) {
              const success = this.openCanvas();
              if (success) {
                this.canvas.addEventListener('selectstart', this.selectStartListener, false);
                this.canvas.addEventListener('touchstart', this.touchStartListener, false);
                document.addEventListener('touchmove', this.touchMoveListener, false);
                document.addEventListener('touchend', this.touchEndListener, false);
                this.canvas.addEventListener('mousedown', this.mouseDownListener, false);
                document.addEventListener('mouseup', this.mouseUpListener, false);
                document.addEventListener('mousemove', this.mouseMoveListener, false);
              }
              return success;
            }
            return false;
          }

          getCanvas() {
            return this.canvas;
          }

          openCanvas() {
            return false;
          }

          closeCanvas() {
          }

          repaint(callback) {
            if (callback != null) {
              this.repaintCallbacks[this.repaintCallbacks.length] = callback;
            }
            if (this.willRepaint == false) {
              this.willRepaint = true;
              const self = this;
              const f = function () {
                self.willRepaint = false;
                const start = new Date().getTime();
                const callbacks = self.repaintCallbacks;
                self.repaintCallbacks = [];
                for (let i = 0; i < callbacks.length; i++) {
                  callbacks[i]();
                }
                const middle = new Date().getTime();
                self.draw();
                const end = new Date().getTime();
              };
              J3DI.requestAnimFrame(f, this.canvas);
            }
          }

          pushMove(move) {
          }

          mouseIntersectionTest(event) {
          }

          drawObjectCanvas2D(obj, mvMatrix, color, phong, forceColorUpdate) {
            if (obj == null || !obj.visible) { return; }
            if (obj.polyIndexArray) {
              this.faceCount += obj.polyIndexArray.length;
            }
            if (obj.vertexArray === null) { return; }
            if (obj.textureScale != null) {
              const textureArray = new Array(obj.textureArray.length);
              for (var i = 0; i < textureArray.length; i += 2) {
                textureArray[i] = (obj.textureArray[i] + obj.textureOffsetX) * obj.textureScale;
                textureArray[i + 1] = (obj.textureArray[i + 1] + obj.textureOffsetY) * obj.textureScale;
              }
              obj.textureArray = textureArray;
              obj.textureScale = null;
            }
            const g = this.g;
            this.mvpMatrix.load(this.viewportMatrix);
            this.mvpMatrix.multiply(this.perspectiveMatrix);
            this.mvpMatrix.multiply(mvMatrix);
            const mvp = this.mvpVertexArray;
            mvp.load(obj.vertexArray);
            mvp.multVecMatrix(this.mvpMatrix);
            const mv = this.mvVertexArray;
            mv.load(obj.vertexArray);
            mv.multVecMatrix(this.mvMatrix);
            if (obj.polyIndexArray !== undefined) {
              for (var j = 0; j < obj.polyIndexArray.length; j++) {
                const poly = obj.polyIndexArray[j];
                var i1 = poly[0];
                var i2 = poly[1];
                var i3 = poly[poly.length - 1];
                var z = mvp.rawZ(i1, i2, i3);
                if (z > 0) {
                  var light = Math.max(0, mv.normal(i1, i2, i3).dot(this.lightNormal));
                  var t = this.deferredFaces[this.deferredFaceCount++];
                  if (t === undefined) {
                    t = new Face();
                    this.deferredFaces.push(t);
                  }
                  t.loadPoly(
                    mvp,
                    obj.textureArray, obj.hasTexture ? this.stickersTexture : null, poly);
                  this.applyFillStyle(t, mv.normal(i1, i2, i3), this.lightNormal, this.observerNormal, phong, color);
                }
              }
            } else {
              for (var j in obj.groups) {
                const isQuad = obj.groups[j][1] == 6;
                if (isQuad) {
                  var i = (obj.groups[j][0]);
                  var i1 = obj.indexArray[i];
                  var i2 = obj.indexArray[i + 1];
                  var i3 = obj.indexArray[i + 2];
                  const i4 = obj.indexArray[i + 3];
                  var z = mvp.rawZ(i1, i2, i3);
                  if (z > 0) {
                    var light = Math.max(0, mv.normal(i1, i2, i3).dot(this.lightNormal));
                    var t = this.deferredFaces[this.deferredFaceCount++];
                    if (t === undefined) {
                      t = new Face();
                      this.deferredFaces.push(t);
                    }
                    t.loadQuad(
                      mvp,
                      obj.textureArray, obj.hasTexture ? this.stickersTexture : null,
                      i1, i2, i3, i4);
                    this.applyFillStyle(t, mv.normal(i1, i2, i3), this.lightNormal, this.observerNormal, phong, color);
                  }
                } else {
                  for (let k = 0; k < obj.groups[j][1]; k += 3) {
                    var i = (obj.groups[j][0] + k);
                    var i1 = obj.indexArray[i];
                    var i2 = obj.indexArray[i + 1];
                    var i3 = obj.indexArray[i + 2];
                    var z = mvp.rawZ(i1, i2, i3);
                    if (z > 0) {
                      var t = this.deferredFaces[this.deferredFaceCount++];
                      if (t === undefined) {
                        t = new Face();
                        this.deferredFaces.push(t);
                      }
                      t.loadTriangle(
                        mvp,
                        obj.textureArray, obj.hasTexture ? this.stickersTexture : null,
                        i1, i2, i3);
                      this.applyFillStyle(t, mv.normal(i1, i2, i3), this.lightNormal, this.observerNormal, phong, color);
                    }
                  }
                }
              }
            }
          }

          applyFillStyle(triangle, n, wi, wo, phong, color) {
            const specular = Math.pow(Math.max(0.0, -(new J3DIVector3(wi).reflect(n).dot(wo))), phong[3]) * phong[2];
            const diffuse = Math.max(0.0, wi.dot(n)) * phong[1];
            const ambient = phong[0];
            const newColor = new Array(3);
            let fs = 'rgb(';
            for (let i = 0; i < 3; i++) {
              if (i != 0) { fs += ','; }
              fs += Math.round(color[i] * (diffuse + ambient) + 255 * specular);
            }
            fs += ')';
            triangle.fillStyle = fs;
            const brightness = (diffuse + ambient) + specular;
            if (brightness >= 1.0) {
              fs = 'rgba(255,255,255,' + (brightness - 1) + ')';
            } else {
              fs = 'rgba(0,0,0,' + (1 - brightness) + ')';
            }
            triangle.lightStyle = fs;
          }
        }
        class AbstractHandler {
          constructor(abstractCanvas) {
            this.canvas = abstractCanvas;
            this.mouseDownX = undefined;
            this.mouseDownY = undefined;
            this.mousePrevX = undefined;
            this.mousePrevY = undefined;
            this.mousePrevTimestamp = undefined;
          }

          onTouchStart(event) {
            if (event.touches.length == 1) {
              event.preventDefault();
              event.clientX = event.touches[0].clientX;
              event.clientY = event.touches[0].clientY;
              this.onMouseDown(event);
            } else {
              this.isMouseDrag = false;
            }
          }

          onTouchEnd(event) {
            event.clientX = this.mousePrevX;
            event.clientY = this.mousePrevY;
            this.onMouseUp(event);
          }

          onTouchMove(event) {
            event.clientX = event.touches[0].clientX;
            event.clientY = event.touches[0].clientY;
            this.onMouseMove(event);
          }

          onMouseDown(event) {
          }

          onMouseMove(event) {
          }

          onMouseOut(event) {
          }

          onMouseUp(event) {
          }
        }
        class Face {
          constructor() {
            this.length = 0;
            this.vertices = new Array(10);
            this.txCoords = new Array(10);
            this.txImage = null;
            this.fillStyle = 'rgb(0,0,0)';
            this.lightStyle = 'rgba(0,0,0,255)';
            this.depth = 0;
          }

          loadTriangle(v, txc, txi, i1, i2, i3) {
            this.length = 6;
            this.vertices[0] = v[i1 * 3];
            this.vertices[1] = v[i1 * 3 + 1];
            this.vertices[2] = v[i2 * 3];
            this.vertices[3] = v[i2 * 3 + 1];
            this.vertices[4] = v[i3 * 3];
            this.vertices[5] = v[i3 * 3 + 1];
            this.txCoords[0] = txc[i1 * 2];
            this.txCoords[1] = txc[i1 * 2 + 1];
            this.txCoords[2] = txc[i2 * 2];
            this.txCoords[3] = txc[i2 * 2 + 1];
            this.txCoords[4] = txc[i3 * 2];
            this.txCoords[5] = txc[i3 * 2 + 1];
            this.txImage = txi;
            this.depth = (v[i1 * 3 + 2] + v[i2 * 3 + 2] + v[i3 * 3 + 2]) / 3;
          }

          loadQuad(v, txc, txi, i1, i2, i3, i4) {
            this.length = 8;
            this.vertices[0] = v[i1 * 3];
            this.vertices[1] = v[i1 * 3 + 1];
            this.vertices[2] = v[i2 * 3];
            this.vertices[3] = v[i2 * 3 + 1];
            this.vertices[4] = v[i3 * 3];
            this.vertices[5] = v[i3 * 3 + 1];
            this.vertices[6] = v[i4 * 3];
            this.vertices[7] = v[i4 * 3 + 1];
            this.txCoords[0] = txc[i1 * 2];
            this.txCoords[1] = txc[i1 * 2 + 1];
            this.txCoords[2] = txc[i2 * 2];
            this.txCoords[3] = txc[i2 * 2 + 1];
            this.txCoords[4] = txc[i3 * 2];
            this.txCoords[5] = txc[i3 * 2 + 1];
            this.txCoords[6] = txc[i4 * 2];
            this.txCoords[7] = txc[i4 * 2 + 1];
            this.txImage = txi;
            this.depth = (v[i1 * 3 + 2] + v[i2 * 3 + 2] + v[i3 * 3 + 2] + v[i4 * 3 + 2]) / 4;
          }

          loadPoly(v, txc, txi, indices) {
            this.length = indices.length * 2;
            this.depth = 0;
            for (let i = 0; i < indices.length; i++) {
              this.vertices[i * 2] = v[indices[i] * 3];
              this.vertices[i * 2 + 1] = v[indices[i] * 3 + 1];
              this.depth += v[indices[i] * 3 + 2];
              this.txCoords[i * 2] = txc[indices[i] * 2];
              this.txCoords[i * 2 + 1] = txc[indices[i] * 2 + 1];
            }
            this.txImage = txi;
            this.depth /= indices.length;
          }

          draw(g) {
            if (this.txImage != null) {
              this.drawTexturedFaceTriangulated(g);
            } else {
              this.drawColoredFace(g);
            }
          }

          drawTexturedFaceTriangulated(g) {
            const v = this.vertices;
            const t = this.txCoords;
            for (let i = 5; i < this.length; i += 2) {
              this.drawTexturedTriangle(g, this.txImage.image,
                v[0], v[1], v[i - 3], v[i - 2], v[i - 1], v[i],
                t[0], t[1], t[i - 3], t[i - 2], t[i - 1], t[i]);
            }
            this.applyExtendedPath(g);
            g.fillStyle = this.lightStyle;
            g.fill();
          }

          drawColoredFace(g) {
            this.applyExtendedPath(g);
            g.fillStyle = this.fillStyle;
            g.fill();
          }

          applyExtendedPath(g) {
            const v = this.vertices;
            const extra = -0.25;
            g.beginPath();
            for (let i = 0; i < this.length; i += 2) {
              const j = (i - 2 + this.length) % this.length;
              const k = (i + 2) % this.length;
              const jx = v[i] - v[j];
              const jy = v[i + 1] - v[j + 1];
              const jlen = Math.sqrt(jx * jx + jy * jy);
              const kx = v[i] - v[k];
              const ky = v[i + 1] - v[k + 1];
              const klen = Math.sqrt(kx * kx + ky * ky);
              if (i == 0) {
                g.moveTo(v[i] + jy * extra / jlen, v[i + 1] - jx * extra / jlen);
                g.lineTo(v[i] - ky * extra / klen, v[i + 1] + kx * extra / klen);
              } else {
                g.lineTo(v[i] + jy * extra / jlen, v[i + 1] - jx * extra / jlen);
                g.lineTo(v[i] - ky * extra / klen, v[i + 1] + kx * extra / klen);
              }
            }
          }

          applySimplePath(g) {
            const v = this.vertices;
            g.beginPath();
            g.moveTo(v[0], v[1]);
            for (let i = 2; i < this.length; i += 2) {
              g.lineTo(v[i], v[i + 1]);
            }
          }

          drawColoredFaceSimple(g) {
            const v = this.vertices;
            g.fillStyle = this.fillStyle;
            g.beginPath();
            g.moveTo(v[0], v[1]);
            for (let i = 2; i < this.length; i += 2) {
              g.lineTo(v[i], v[i + 1]);
            }
            g.fill();
          }

          drawTexturedTriangle(g, img, x0, y0, x1, y1, x2, y2,
            u0, v0, u1, v1, u2, v2) {
            if (x0 != x0 || y0 != y0 || x1 != x1 || y1 != y1 || x2 != x2 || y2 != y2) { return; }
            if (u0 != u0 || v0 != v0 || u1 != u1 || v1 != v1 || u2 != u2 || v2 != v2) { return; }
            const cx0 = x0; const cy0 = y0; const cx1 = x1; const cy1 = y1; const cx2 = x2; const cy2 = y2;
            const cu0 = u0; const cv0 = v0; const cu1 = u1; const cv1 = v1; const cu2 = u2; const cv2 = v2;
            u0 *= img.width;
            v0 *= img.height;
            u1 *= img.width;
            v1 *= img.height;
            u2 *= img.width;
            v2 *= img.height;
            x1 -= x0;
            y1 -= y0;
            x2 -= x0;
            y2 -= y0;
            u1 -= u0;
            v1 -= v0;
            u2 -= u0;
            v2 -= v0;
            const det = 1 / (u1 * v2 - u2 * v1);
            const a = (v2 * x1 - v1 * x2) * det;
            const b = (v2 * y1 - v1 * y2) * det;
            const c = (u1 * x2 - u2 * x1) * det;
            const d = (u1 * y2 - u2 * y1) * det;
            const e = x0 - a * u0 - c * v0;
            const f = y0 - b * u0 - d * v0;
            const v = [cx0, cy0, cx1, cy1, cx2, cy2];
            const extra = -0.3;
            const len = 6;
            g.beginPath();
            for (let i = 0; i < len; i += 2) {
              const j = (i - 2 + len) % len;
              const k = (i + 2) % len;
              const jx = v[i] - v[j];
              const jy = v[i + 1] - v[j + 1];
              const jlen = Math.sqrt(jx * jx + jy * jy);
              const kx = v[i] - v[k];
              const ky = v[i + 1] - v[k + 1];
              const klen = Math.sqrt(kx * kx + ky * ky);
              if (i == 0) {
                g.moveTo(v[i] + jy * extra / jlen, v[i + 1] - jx * extra / jlen);
                g.lineTo(v[i] - ky * extra / klen, v[i + 1] + kx * extra / klen);
              } else {
                g.lineTo(v[i] + jy * extra / jlen, v[i + 1] - jx * extra / jlen);
                g.lineTo(v[i] - ky * extra / klen, v[i + 1] + kx * extra / klen);
              }
            }
            g.closePath();
            g.save();
            g.transform(a, b, c, d, e, f);
            g.clip();
            g.drawImage(img, 0, 0);
            g.restore();
          }
        }
        return {
          AbstractCanvas: AbstractCanvas,
          AbstractHandler: AbstractHandler,
          Face: Face
        };
      });
    'use strict';
    define('AbstractPlayerApplet', ['AbstractCanvas', 'Node3D', 'J3DI', 'J3DIMath', 'ScriptNotation',
      'ScriptAST', 'ScriptParser', 'Tokenizer',
      'RubiksCubeS1Cube3D',
      'RubiksCubeS4Cube3D',
      'RubiksCubeS5Cube3D',
      'PocketCubeS1Cube3D',
      'PocketCubeS4Cube3D',
      'PocketCubeS5Cube3D'
    ],
    function (AbstractCanvas, Node3D, J3DI, J3DIMath, Notation,
      AST, ScriptParser, Tokenizer,
      RubiksCubeS1Cube3D,
      RubiksCubeS4Cube3D,
      RubiksCubeS5Cube3D,
      PocketCubeS1Cube3D,
      PocketCubeS4Cube3D,
      PocketCubeS5Cube3D
    ) {
      const module = {
        log: (false) ? console.log : () => {},
        info: (true) ? console.info : () => {},
        warning: (true) ? console.warning : () => {},
        error: (true) ? console.error : () => {}
      };
      const parseColorMap = function (str) {
        const map = [];
        if (str == null) { return map; }
        const tokens = str.split(/([ =,\n]+)/);
        let elementIndex = 0;
        for (let i = 0; i < tokens.length;) {
          let key = null;
          if (i < tokens.length - 1 && tokens[i + 1].indexOf('=') != -1) {
            if (!tokens[i].match(/^\w+$/)) {
              module.error('illegal key:"' + key + '" in map:"' + str + '"');
              break;
            } else {
              key = tokens[i];
            }
            i += 2; // consume key and '=' after key
          }
          if (tokens[i].match(/^(0x|#)[0-9a-fA-F]+$/)) {
            let stringValue = tokens[i];
            let hasAlpha = false;
            if (stringValue[0] == '#') {
              stringValue = '0x' + stringValue.substring(1);
            }
            hasAlpha = stringValue.length == 10;
            const intValue = parseInt(stringValue);
            const rgbaValue = [(intValue >>> 16) & 0xff, (intValue >>> 8) & 0xff, intValue & 0xff,
              hasAlpha ? ((intValue >>> 24) & 0xff) : 0xff];
            if (key != null) {
              map[key] = rgbaValue;
            }
            map[elementIndex] = rgbaValue;
            i++;
            elementIndex++;
          } else if (tokens[i].match(/^[ ,]+$/)) {
            i++;
          } else {
            module.error('illegal token:"' + tokens[i] + '" in map:"' + str + '"');
            break;
          }
        }
        return map;
      };
      const parseWordList = function (str) {
        const map = [];
        if (str == null) { return map; }
        const tokens = str.split(/([ ,]+)/);
        let elementIndex = 0;
        for (let i = 0; i < tokens.length;) {
          if (tokens[i].match(/^[ ,]+$/)) {
            i++;
          } else {
            const stringValue = tokens[i];
            map[elementIndex] = stringValue;
            i++;
            elementIndex++;
          }
        }
        return map;
      };
      const parserMacroDefinitions = function (str) {
        const t = new Tokenizer.PushBackReader(str);
        const defs = {};
        do {
          t.skipWhitespace();
          let quote = t.read();
          if (quote == null) { break; }
          let id = '';
          if (/\w/.test(quote)) {
            id = quote;
            for (let ch = t.read(); ch != null && ch != '='; ch = t.read()) {
              id = id + ch;
            }
            id = id.trim();
            t.pushBack();
          } else {
            for (let ch = t.read(); ch != null && ch != quote; ch = t.read()) {
              id = id + ch;
            }
          }
          t.skipWhitespace();
          const equal = t.read();
          if (equal != '=') { throw new ScriptParser.ParseException('= expected, ch:' + equal, t.getPosition() - 1, t.getPosition()); }
          t.skipWhitespace();
          quote = t.read();
          if (quote == null) { throw new ScriptParser.ParseException('quote around value expected, ch:' + ch, t.getPosition() - 1, t.getPosition()); }
          let value = '';
          if (/\w/.test(quote)) {
            value = quote;
            for (let ch = t.read(); ch != null && ch != ','; ch = t.read()) {
              value = value + ch;
            }
            value = value.trim();
            t.pushBack();
          } else {
            for (let ch = t.read(); ch != null && ch != quote; ch = t.read()) {
              value = value + ch;
            }
          }
          t.skipWhitespace();
          const comma = t.read();
          if (comma != ',') {
            t.pushBack();
          }
          defs[id] = value;
        } while (t.getChar() != null);
        return defs;
      };
      class AbstractPlayerApplet extends AbstractCanvas.AbstractCanvas {
        constructor() {
          super();
          this.handler = new Cube3DHandler(this);
          this.canvas = null;
          this.cube3d = null;
          this.currentAngle = 0;
          this.autorotate = false;
          this.autorotateFunction = null;
          this.rotateFunction = null;
          this.rotationMatrix = new J3DIMatrix4();
          this.smoothRotationFunction = null;
          this.spin = new J3DIVector3();
          this.useFullModel = true;
          this.moves = [];
          this.undoList = [];
          this.redoIndex = 0;
          this.stickersTexture = null;
          this.parameters = {
            baseurl: 'lib/',
            colortable: null,
            colorlist: null
          };
        }

        createCube3D() {
          this.debugFPS = this.canvas.getAttribute('debug').indexOf('fps') != -1;
          const c = this.canvas.getAttribute('kind');
          let cname = c == null || c == 'null' ? '' : c.trim();
          if (cname.length == 0) {
            cname = 'RubiksCube';
          }
          const isParts = (cname.lastIndexOf(' parts') == cname.length - 6);
          if (isParts) {
            cname = cname.substring(0, cname.length - 6);
          }
          const isSpecificModel = (cname.lastIndexOf(' s') == cname.length - 3);
          if (!isSpecificModel) {
            if (this.useFullModel) {
              cname = cname + ' s4';
            } else {
              cname = cname + ' s2';
            }
          }
          let c3d = null;
          switch (cname) {
            case 'RubiksCube s1' :
            case 'RubiksCube s2' :
              c3d = new RubiksCubeS1Cube3D.Cube3D();
              break;
            case 'RubiksCube s3' :
            case 'RubiksCube s4' :
              c3d = new RubiksCubeS4Cube3D.Cube3D();
              break;
            case 'RubiksCube s5' :
              c3d = new RubiksCubeS5Cube3D.Cube3D();
              break;
            case 'PocketCube s1' :
            case 'PocketCube s2' :
              c3d = new PocketCubeS1Cube3D.Cube3D();
              break;
            case 'PocketCube s3' :
            case 'PocketCube s4' :
              c3d = new PocketCubeS4Cube3D.Cube3D();
              break;
            case 'PocketCube s5' :
              c3d = new PocketCubeS5Cube3D.Cube3D();
              break;
            default :
              module.error('illegal cube attribute :' + cname);
              if (this.useFullModel) {
                c3d = new RubiksCubeS4Cube3D.Cube3D();
              } else {
                c3d = new RubiksCubeS1Cube3D.Cube3D();
              }
          }
          if (c3d != null) {
            c3d.baseUrl = this.parameters.baseurl;
            c3d.loadGeometry();
            if (isParts) {
              const a = c3d.attributes;
              for (let i = 0; i < a.stickersFillColor.length; i++) {
                a.stickersFillColor[i] = a.partsFillColor[0];
                a.stickersPhong[i] = a.partsPhong[0];
              }
            }
            return c3d;
          }
        }

        setCube3D(cube3d) {
          this.cube3d = cube3d;
        }

        getCube3D() {
          return this.cube3d;
        }

        initScene() {
          const self = this;
          const fRepaint = function () {
            self.repaint();
          };
          this.world = new Node3D.Node3D();
          this.cube3d = this.createCube3D();
          this.readParameters(this.cube3d);
          this.cube3d.repaintFunction = fRepaint;
          this.cubeSize = this.cube3d.partSize * this.cube3d.cube.layerCount;
          this.world.add(this.cube3d);
          this.cube = this.cube3d.cube;
          this.cube3d.addChangeListener(this);
          const attr = this.cube3d.attributes;
          this.cubeSize = this.cube3d.partSize * this.cube3d.cube.layerCount;
          this.currentAngle = 0;
          this.xRot = attr.xRot;
          this.yRot = attr.yRot;
          this.camPos = new J3DIVector3(0, 0, -this.cubeSize * 1.35);
          this.lookAtPos = new J3DIVector3(0, 0, 0);
          this.up = new J3DIVector3(0, 1, 0);
          this.lightPos = new J3DIVector3(4, -4, 8);
          this.lightNormal = new J3DIVector3(-4, 4, -8).normalize();
          this.observerNormal = new J3DIVector3(this.camPos).normalize();
          const stickersImageURL = this.canvas.getAttribute('stickersimage');
          if (stickersImageURL != null && stickersImageURL != 'null') {
            attr.stickersImageURL = stickersImageURL;
          }
          if (attr.stickersImageURL) {
            J3DI.loadImageTexture(this.gl, attr.stickersImageURL, texture => {
              self.stickersTexture = texture;
              fRepaint();
            });
          }
          this.cube3d.validateAttributes();
          this.mvMatrix = new J3DIMatrix4();
          this.perspectiveMatrix = new J3DIMatrix4();
          this.mvpMatrix = new J3DIMatrix4();
          this.mvNormalMatrix = new J3DIMatrix4();
          this.invCameraMatrix = new J3DIMatrix4();
          this.cameraMatrix = new J3DIMatrix4();
          this.rotationMatrix = new J3DIMatrix4();
          this.viewportMatrix = new J3DIMatrix4();
          this.forceColorUpdate = false;
          this.reset();
        }

        updateMatrices() {
          this.cameraMatrix.makeIdentity();
          this.cameraMatrix.lookat(
            this.camPos[0], this.camPos[1], this.camPos[2],
            this.lookAtPos[0], this.lookAtPos[1], this.lookAtPos[2],
            this.up[0], this.up[1], this.up[2]
          );
          const flip = new J3DIMatrix4();
          flip.scale(1, 1, -1);
          flip.multiply(this.cameraMatrix);
          this.cameraMatrix.load(flip);
          this.perspectiveMatrix.makeIdentity();
          this.perspectiveMatrix.perspective(30, this.width / this.height, 1, 12);
          this.perspectiveMatrix.multiply(this.cameraMatrix);
          this.invCameraMatrix.load(this.cameraMatrix);
          this.invCameraMatrix.invert();
          this.rasterToCameraMatrix = new J3DIMatrix4(this.perspectiveMatrix);
          this.rasterToCameraMatrix.invert();
          const attr = this.cube3d.attributes;
          const wvMatrix = this.world.matrix;
          wvMatrix.makeIdentity();
          wvMatrix.multiply(this.rotationMatrix);
          wvMatrix.rotate(attr.xRot, 1, 0, 0);
          wvMatrix.rotate(attr.yRot, 0, -1, 0);
          wvMatrix.rotate(this.currentAngle, 1, 1, 1);
          const scaleFactor = 0.4 * attr.scaleFactor;
          wvMatrix.scale(scaleFactor, scaleFactor, scaleFactor);
        }

        draw() {
          if (!this.camPos) { return; }
          this.reshape();
          this.updateMatrices();
          this.cube3d.doValidateDevelopAttributes();
          const self = this;
          this.clearCanvas();
          const start = new Date().getTime();
          this.faceCount = 0;
          if (this.cube3d.isDrawTwoPass) {
            this.drawTwoPass(this.cube3d);
          } else {
            this.drawSinglePass(this.cube3d);
          }
          if (this.debugFPS && this.g != null) {
            const end = new Date().getTime();
            const elapsed = end - start;
            const g = this.g;
            g.fillStyle = 'rgb(0,0,0)';
            g.fillText('faces:' + (this.faceCount) +
              ' elapsed:' + (end - start)
            , 20, 20);
          }
        }

        drawSinglePass(cube3d) {
          const self = this;
          cube3d.repainter = this;
          const attr = this.cube3d.attributes;
          cube3d.updateAttributes();
          const mvMatrix = this.mvMatrix;
          for (let i = 0; i < cube3d.centerCount; i++) {
            if (!attr.isPartVisible(cube3d.centerOffset + i)) { continue; }
            mvMatrix.makeIdentity();
            cube3d.parts[cube3d.centerOffset + i].transform(mvMatrix);
            const cparts = attr.partsFillColor[cube3d.centerOffset + i];
            this.drawObject(cube3d.centerObj, mvMatrix, cparts, attr.partsPhong[this.cube3d.centerOffset + i]);
          }
          for (let i = 0; i < cube3d.sideCount; i++) {
            if (!attr.isPartVisible(cube3d.sideOffset + i)) { continue; }
            mvMatrix.makeIdentity();
            cube3d.parts[cube3d.sideOffset + i].transform(mvMatrix);
            const cparts = attr.partsFillColor[cube3d.sideOffset + i];
            this.drawObject(cube3d.sideObj, mvMatrix, cparts, attr.partsPhong[this.cube3d.sideOffset + i]);
            const si = cube3d.getStickerIndexForPartIndex(cube3d.sideOffset + i, 0);
            this.drawObject(cube3d.stickerObjs[si], mvMatrix,
              attr.stickersFillColor[si],
              attr.stickersPhong[si]);
          }
          for (let i = 0; i < cube3d.edgeCount; i++) {
            if (!attr.isPartVisible(cube3d.edgeOffset + i)) { continue; }
            mvMatrix.makeIdentity();
            this.cube3d.parts[cube3d.edgeOffset + i].transform(mvMatrix);
            const cparts = attr.partsFillColor[cube3d.edgeOffset + i];
            this.drawObject(cube3d.edgeObj, mvMatrix, cparts, attr.partsPhong[this.cube3d.edgeOffset + i]);
            let si = cube3d.getStickerIndexForPartIndex(cube3d.edgeOffset + i, 0);
            this.drawObject(cube3d.stickerObjs[si], mvMatrix,
              attr.stickersFillColor[si],
              attr.stickersPhong[si]);
            si = cube3d.getStickerIndexForPartIndex(cube3d.edgeOffset + i, 1);
            this.drawObject(cube3d.stickerObjs[si], mvMatrix,
              attr.stickersFillColor[si],
              attr.stickersPhong[si]);
          }
          for (let i = 0; i < cube3d.cornerCount; i++) {
            if (!attr.isPartVisible(cube3d.cornerOffset + i)) { continue; }
            mvMatrix.makeIdentity();
            this.cube3d.parts[cube3d.cornerOffset + i].transform(mvMatrix);
            const cparts = attr.partsFillColor[cube3d.cornerOffset + i];
            this.drawObject(cube3d.cornerObj, mvMatrix, cparts, attr.partsPhong[this.cube3d.cornerOffset + i], this.forceColorUpdate);
            let si = cube3d.getStickerIndexForPartIndex(cube3d.cornerOffset + i, 1);
            this.drawObject(cube3d.stickerObjs[si], mvMatrix, attr.stickersFillColor[si], attr.stickersPhong[si], this.forceColorUpdate);
            si = cube3d.getStickerIndexForPartIndex(cube3d.cornerOffset + i, 0);
            this.drawObject(cube3d.stickerObjs[si], mvMatrix, attr.stickersFillColor[si], attr.stickersPhong[si], this.forceColorUpdate);
            si = cube3d.getStickerIndexForPartIndex(cube3d.cornerOffset + i, 2);
            this.drawObject(cube3d.stickerObjs[si], mvMatrix, attr.stickersFillColor[si], attr.stickersPhong[si], this.forceColorUpdate);
          }
          this.flushCanvas();
          this.forceColorUpdate = false;
        }

        drawTwoPass(cube3d) {
          if (!this.camPos) { return; }
          this.reshape();
          this.updateMatrices();
          const self = this;
          this.clearCanvas();
          cube3d.repainter = this;
          cube3d.validateAttributes();
          const attr = cube3d.attributes;
          const ccenter = attr.partsFillColor[cube3d.centerOffset];
          const cparts = attr.partsFillColor[cube3d.cornerOffset];
          const mvMatrix = this.mvMatrix;
          {
            for (let i = 0; i < this.cube3d.centerCount; i++) {
              mvMatrix.makeIdentity();
              cube3d.parts[cube3d.centerOffset + i].transform(mvMatrix);
              this.drawObject(cube3d.centerObj, mvMatrix, ccenter, attr.partsPhong[cube3d.centerOffset + i]);
            }
            for (let i = 0; i < cube3d.sideCount; i++) {
              mvMatrix.makeIdentity();
              cube3d.parts[cube3d.sideOffset + i].transform(mvMatrix);
              this.drawObject(cube3d.sideObj, mvMatrix, cparts, attr.partsPhong[cube3d.sideOffset + i]);
            }
            for (let i = 0; i < cube3d.edgeCount; i++) {
              mvMatrix.makeIdentity();
              this.cube3d.parts[cube3d.edgeOffset + i].transform(mvMatrix);
              this.drawObject(cube3d.edgeObj, mvMatrix, cparts, attr.partsPhong[this.cube3d.edgeOffset + i]);
            }
            for (let i = 0; i < cube3d.cornerCount; i++) {
              mvMatrix.makeIdentity();
              this.cube3d.parts[cube3d.cornerOffset + i].transform(mvMatrix);
              this.drawObject(cube3d.cornerObj, mvMatrix, cparts, attr.partsPhong[this.cube3d.cornerOffset + i], this.forceColorUpdate);
            }
            this.flushCanvas();
          }
          if (true) {
            for (let i = 0; i < cube3d.sideCount; i++) {
              mvMatrix.makeIdentity();
              cube3d.parts[cube3d.sideOffset + i].transform(mvMatrix);
              const si = cube3d.getStickerIndexForPartIndex(cube3d.sideOffset + i, 0);
              this.drawObject(cube3d.stickerObjs[si], mvMatrix,
                attr.stickersFillColor[si],
                attr.stickersPhong[si]);
            }
            for (let i = 0; i < cube3d.edgeCount; i++) {
              mvMatrix.makeIdentity();
              this.cube3d.parts[cube3d.edgeOffset + i].transform(mvMatrix);
              let si = cube3d.getStickerIndexForPartIndex(cube3d.edgeOffset + i, 0);
              this.drawObject(cube3d.stickerObjs[si], mvMatrix,
                attr.stickersFillColor[si],
                attr.stickersPhong[si]);
              si = cube3d.getStickerIndexForPartIndex(cube3d.edgeOffset + i, 1);
              this.drawObject(cube3d.stickerObjs[si], mvMatrix,
                attr.stickersFillColor[si],
                attr.stickersPhong[si]);
            }
            for (let i = 0; i < cube3d.cornerCount; i++) {
              mvMatrix.makeIdentity();
              this.cube3d.parts[cube3d.cornerOffset + i].transform(mvMatrix);
              let si = cube3d.getStickerIndexForPartIndex(cube3d.cornerOffset + i, 1);
              this.drawObject(cube3d.stickerObjs[si], mvMatrix, attr.stickersFillColor[si], attr.stickersPhong[si], this.forceColorUpdate);
              si = cube3d.getStickerIndexForPartIndex(cube3d.cornerOffset + i, 0);
              this.drawObject(cube3d.stickerObjs[si], mvMatrix, attr.stickersFillColor[si], attr.stickersPhong[si], this.forceColorUpdate);
              si = cube3d.getStickerIndexForPartIndex(cube3d.cornerOffset + i, 2);
              this.drawObject(cube3d.stickerObjs[si], mvMatrix, attr.stickersFillColor[si], attr.stickersPhong[si], this.forceColorUpdate);
            }
            this.flushCanvas();
            this.forceColorUpdate = false;
          }
        }

        reset() {
          this.currentAngle = 0;
          this.xRot = this.cube3d.attributes.xRot;
          this.yRot = this.cube3d.attributes.yRot;
          this.rotationMatrix.makeIdentity();
          this.smoothRotationFunction = null;
          this.moves = [];
          const self = this;
          const f = function () {
            self.cube.cancel = true;
            if (self.cube3d.isTwisting) {
              self.repaint(f);
              return;
            }
            self.cube3d.repainter = null;
            self.cube.reset();
            if (self.initscript != null) {
              self.initscript.applyTo(self.cube);
            }
            self.clearUndoRedo();
            self.cube3d.repainter = this;
            self.cube.cancel = false;
          };
          this.repaint(f);

        }

        pushMove(move) {
          this.moves.push(move);
          if (this.redoIndex < this.undoList.length) {
            this.undoList = this.undoList.splice(0, this.redoIndex);
          }
          this.undoList.push(move);
          this.redoIndex = this.undoList.length;
        }

        undo() {
          if (this.redoIndex > 0) {
            const move = this.undoList[--this.redoIndex];
            move.applyInverseTo(this.cube);
            if (this.cube.isSolved()) {
              this.wobble();
            }
          }
        }

        redo() {
          if (this.redoIndex < this.undoList.length) {
            const move = this.undoList[this.redoIndex++];
            move.applyTo(this.cube);
            if (this.cube.isSolved()) {
              this.wobble();
            }
          }
        }

        clearUndoRedo() {
          this.undoList = [];
          this.redoIndex = 0;
        }

        play() {
          if (this.cube.isSolved()) {
            this.scramble();
          } else {
            this.solve();
          }
        }

        solveStep() {
          const owner = new Object();
          if (!this.cube.lock(owner)) {
            return false;
          }
          this.cube.unlock(owner);
          return this.doSolveStep();
        }

        doSolveStep() {
          if (this.cube.isSolved()) {
            this.moves = [];
            return true;
          } else if (this.moves.length == 0) {
            this.reset();
            return true;
          } else {
            const move = this.moves.pop();
            move.applyInverseTo(this.cube);
            if (this.cube.isSolved()) {
              this.moves = [];
              this.wobble();
              return true;
            }
            return false;
          }
        }

        solve() {
          const self = this;
          const owner = new Object();
          const f = function () {
            if (!self.cube.lock(owner)) {
              self.repaint(f);
              return;
            }
            if (self.cube3d.isTwisting) {
              self.repaint(f);
              return;
            }
            self.cube3d.attributes.twistDuration = self.cube3d.attributes.scrambleTwistDuration;
            if (!self.cube.cancel) {
              if (!self.doSolveStep()) {
                self.repaint(f);
                return;
              }
            }
            self.cube3d.attributes.twistDuration = self.cube3d.attributes.userTwistDuration;
            self.clearUndoRedo();
            self.cube.unlock(owner);
          };
          this.repaint(f);
        }

        scramble(scrambleCount, animate) {
          if (scrambleCount == null) { scrambleCount = 16; }
          if (animate == null) { animate = true; }
          const self = this;
          this.clearUndoRedo();
          const layerCount = this.cube3d.cube.layerCount;
          const scrambleNodes = ScriptParser.createRandomScript(layerCount, scrambleCount);
          this.moves = this.moves.concat(scrambleNodes);
          if (!animate) {
            const f = function () {
              self.cube.cancel = true;
              if (self.cube3d.isTwisting) {
                self.repaint(f);
                return;
              }
              for (let i = 0; i < scrambleNodes.length; i++) {
                scrambleNodes[i].applyTo(self.cube);
              }
              self.cube.cancel = false;
            };
            this.repaint(f);
            return;
          }
          let next = 0;
          const owner = new Object();
          const f = function () {
            if (!self.cube.lock(owner)) {
              self.repaint(f);
              return;
            }
            if (self.cube3d.isTwisting) {
              self.repaint(f);
              return;
            }
            if (next == 0) {
              self.cube3d.attributes.twistDuration = self.cube3d.attributes.scrambleTwistDuration;
            }
            if (self.cube.cancel) {
              next = scrambleNodes.length;
            }
            if (next < scrambleNodes.length) {
              scrambleNodes[next].applyTo(self.cube);
              next++;
              self.repaint(f);
            } else {
              self.cube3d.attributes.twistDuration = self.cube3d.attributes.userTwistDuration;
              self.cube.unlock(owner);
            }
          };
          this.repaint(f);
        }

        setAutorotate(newValue) {
          if (newValue != this.autorotate) {
            this.autorotate = newValue;
            if (newValue) {
              const self = this;
              const start = new Date().getTime();
              const anglePerSecond = 20;
              const prev = start;
              const startAngle = this.currentAngle;
              this.autorotateFunction = function () {
                if (self.autorotate) { self.repaint(self.autorotateFunction); }
                const now = new Date().getTime();
                const elapsed = now - start;
                self.currentAngle = (startAngle + elapsed * anglePerSecond / 1000) % 360;
              };
              this.repaint(this.autorotateFunction);
            }
          }
        }

        rotate(dx, dy) {
          const rm = new J3DIMatrix4();
          rm.rotate(dy, 0, 1, 0);
          rm.rotate(dx, 1, 0, 0);
          rm.multiply(this.rotationMatrix);
          this.rotationMatrix.load(rm);
          this.repaint();
        }

        wobble(amount, duration) {
          if (amount == null) { amount = 0.3; }
          if (duration == null) { duration = 500; }
          const self = this;
          const start = new Date().getTime();
          const f = function () {
            const now = new Date().getTime();
            const elapsed = now - start;
            const x = elapsed / duration;
            if (x < 1) {
              self.repaint(f);
              self.cube3d.attributes.scaleFactor = 1 + amount * Math.pow(1 - Math.pow(x * 2 - 1, 2), 4);
            } else {
              self.cube3d.attributes.scaleFactor = 1;
            }
          };
          this.repaint(f);
        }

        explode(amount, duration) {
          if (amount == null) { amount = 2; }
          if (duration == null) { duration = 2000; }
          const self = this;
          const start = new Date().getTime();
          const f = function () {
            const now = new Date().getTime();
            const elapsed = now - start;
            const x = elapsed / duration;
            if (x < 1) {
              self.repaint(f);
              self.cube3d.attributes.explosionFactor = amount * Math.pow(1 - Math.pow(x * 2 - 1, 2), 4);
              self.cube3d.updateExplosionFactor();
            } else {
              self.cube3d.attributes.explosionFactor = 0;
              self.cube3d.updateExplosionFactor();
            }
          };
          this.repaint(f);
        }

        stateChanged(event) {
          this.repaint();
        }

        getCubeAttributes() {
          return this.cube3d.attributes;
        }

        setCubeAttributes(attr) {
          this.cube3d.attributes = attr;
          this.forceColorUpdate = true;
          const gl = this.gl;
          gl.clearColor(attr.backgroundColor[0] / 255.0, attr.backgroundColor[1] / 255.0,
            attr.backgroundColor[2] / 255.0, attr.backgroundColor[3] / 255.0);
        }

        mouseIntersectionTest(event) {
          const rect = this.canvas.getBoundingClientRect();
          const pRaster = new J3DIVector3(event.clientX - rect.left, event.clientY - rect.top, 0);
          const pCamera = new J3DIVector3((pRaster[0] - this.width / 2) / this.width * 2, (pRaster[1] - this.height / 2) / -this.height * 2, 0);
          const pWorld = new J3DIVector3(pCamera);
          pWorld.multVecMatrix(this.rasterToCameraMatrix);
          const wmMatrix = new J3DIMatrix4(this.world.matrix);
          wmMatrix.multiply(this.cube3d.matrix);
          wmMatrix.invert();
          const pModel = new J3DIVector3(pWorld);
          pModel.multVecMatrix(wmMatrix);
          const ray = { point: new J3DIVector3(), dir: new J3DIVector3() };
          ray.point.load(this.camPos);
          ray.point.multVecMatrix(wmMatrix);
          ray.dir.load(pModel);
          ray.dir.subtract(ray.point);
          ray.dir.normalize();
          const isect = this.cube3d.intersect(ray);
          return isect;
        }

        readParameters(cube3d) {
          this.readOrientationParameters(cube3d);
          this.readColorParameters(cube3d);
          this.readPartParameters(cube3d);
          this.readScriptParameters(cube3d);
        }

        readColorParameters(cube3d) {
          const a = cube3d.attributes;
          const p = this.parameters;
          const deprecatedFaceIndices = [2, 0, 3, 5, 4, 1];
          let deprecatedColorMap = {};// parseColorMap("r=#ff4600,u=#ffd200,f=#003373,l=#8c000f,d=#f8f8f8,b=#00732f");
          let colorMap = parseColorMap('r=#ffd200,u=#003373,f=#8c000f,l=#f8f8f8,d=#00732f,b=#ff4600');
          for (const k in colorMap) {
            if (k >= 0 && k <= colorMap.length) {
              deprecatedColorMap[k] = colorMap[deprecatedFaceIndices[k]];
            } else {
              deprecatedColorMap[k] = colorMap[k];
            }
          }
          if (p.colortable != null) {
            module.log('.readParameters colortable:' + p.colortable);
            module.warning('the parameter "colorTable" is deprecated, use "colorList" instead.');
            const parsedColorMap = parseColorMap(p.colortable);
            for (const k in parsedColorMap) {
              if (k >= 0 && k < deprecatedFaceIndices.length) {
                colorMap[deprecatedFaceIndices[k]] = parsedColorMap[k];
              } else {
                colorMap[k] = parsedColorMap[k];
              }
            }
            deprecatedColorMap = colorMap;
          }
          if (p.colorlist != null) {
            module.log('.readParameters colorlist:' + p.colorlist);
            colorMap = parseColorMap(this.parameters.colorlist);
            deprecatedColorMap = colorMap;
          }
          let faceIndices = [];
          let currentColorMap = colorMap;
          for (let i = 0; i < a.getFaceCount(); i++) {
            faceIndices[i] = i;
          }
          if (p.faces != null) {
            module.log('.readParameters faces:' + p.faces);
            module.warning('the parameter "faces" is deprecated, please use "faceList" instead.');
            const parsedIndices = parseWordList(p.faces);
            for (const i in parsedIndices) {
              faceIndices[deprecatedFaceIndices[i]] = parsedIndices[i];
            }
            currentColorMap = deprecatedColorMap;
          }
          if (p.facelist != null) {
            module.log('.readParameters facelist:' + p.facelist);
            faceIndices = parseWordList(p.facelist);
          }
          for (let i = 0; i < a.getFaceCount(); i++) {
            const color = currentColorMap[faceIndices[i]];
            if (color != null) {
              const face = i;
              const offset = a.getStickerOffset(face);
              for (let j = 0; j < a.getStickerCount(face); j++) {
                a.stickersFillColor[offset + j] = color;
              }
            }
          }
        }

        readScriptParameters(cube3d) {
          const a = cube3d.attributes;
          const p = this.parameters;
          if (p.resourcefile != null) {
            module.log('.readParameters resourcefile:' + p.resourcefile);
          }
          const notation = new Notation.DefaultNotation();
          if (p.scriptmacros != null) {
            module.log('.readParameters scriptmacros:' + p.scriptmacros);
            try {
              this.macros = parserMacroDefinitions(p.scriptmacros);
              module.log('.readParameters scriptmacros: %o', this.macros);
            } catch (e) {
              module.error(e);
              module.error('illegal scriptmacros:"' + p.scriptmacros + '"');
            }
          }
          if (p.script != null) {
            module.log('.readParameters script:' + p.script);
            const parser = new ScriptParser.ScriptParser(notation);
            try {
              this.script = parser.parse(p.script);
            } catch (e) {
              module.error(e);
              module.error('illegal script:%s', p.script);
            }
          }
          if (p.initscript != null) {
            module.log('.readParameters initscript:' + p.initscript);
            const notation = new Notation.DefaultNotation();
            const parser = new ScriptParser.ScriptParser(notation);
            try {
              this.initscript = parser.parse(p.initscript);
            } catch (e) {
              module.error(e);
              module.error('illegal initscript:"' + p.initscript + '"');
            }
          }
        }

        readOrientationParameters(cube3d) {
          const a = cube3d.attributes;
          const p = this.parameters;
          if (p.alpha != null) {
            module.log('.readParameters alpha:' + p.alpha);
            cube3d.attributes.xRot = parseFloat(p.alpha);
          }
          if (p.beta != null) {
            module.log('.readParameters beta:' + p.beta);
            cube3d.attributes.yRot = -parseFloat(p.beta);
          }
        }

        readPartParameters(cube3d) {
          const a = cube3d.attributes;
          const p = this.parameters;
          const cube = cube3d.getCube();
          if (p.partlist != null) {
            module.log('.readParameters partlist:' + p.partlist);
            const str = p.partlist;
            const tokens = str.split(/[ ,\n]+/);
            for (let i = 0; i < a.getPartCount(); i++) {
              a.setPartVisible(i, false);
            }
            let isError = false;
            for (let i = 0; i < tokens.length; i++) {
              const partName = tokens[i];
              const partIndex = cube.NAME_PART_MAP[partName];
              if (partIndex == null) {
                module.error('illegal part:"' + partName + '" in partlist');
                isError = true;
              }
              a.setPartVisible(partIndex, true);
            }
            if (isError) {
              module.error('illegal partlist:"' + p.partlist + '"');
            }
          }
        }
      }
      class Cube3DHandler extends AbstractCanvas.AbstractHandler {
        constructor(abstractCanvas) {
          super();
          this.canvas = abstractCanvas;
          this.mouseDownX = undefined;
          this.mouseDownY = undefined;
          this.mousePrevX = undefined;
          this.mousePrevY = undefined;
          this.mousePrevTimestamp = undefined;
        }

        onTouchStart(event) {
          if (event.touches.length == 1) {
            event.preventDefault();
            event.clientX = event.touches[0].clientX;
            event.clientY = event.touches[0].clientY;
            this.onMouseDown(event);
          } else {
            this.isMouseDrag = false;
          }
        }

        onTouchEnd(event) {
          event.clientX = this.mousePrevX;
          event.clientY = this.mousePrevY;
          this.onMouseUp(event);
        }

        onTouchMove(event) {
          event.clientX = event.touches[0].clientX;
          event.clientY = event.touches[0].clientY;
          this.onMouseMove(event);
        }

        onMouseDown(event) {
          this.mouseDownX = event.clientX;
          this.mouseDownY = event.clientY;
          this.mousePrevX = event.clientX;
          this.mousePrevY = event.clientY;
          this.mousePrevTimeStamp = event.timeStamp;
          this.isMouseDrag = true;
          const isect = this.canvas.mouseIntersectionTest(event);
          this.mouseDownIsect = isect;
          this.isCubeSwipe = isect != null;
        }

        onMouseMove(event) {
          if (this.isMouseDrag) {
            const x = event.clientX;
            const y = event.clientY;
            const dx2d = (this.mousePrevY - y);
            const dy2d = (this.mousePrevX - x);
            const dx = dx2d * (360 / this.canvas.width);
            const dy = dy2d * (360 / this.canvas.height);
            const mouseTimestep = (event.timeStamp - this.mousePrevTimeStamp) / 1000;
            if (this.isCubeSwipe) {
              const cube3d = this.canvas.cube3d;
              const sqrDist = dx2d * dx2d + dy2d * dy2d;
              if (!cube3d.isTwisting && sqrDist > 16) {
                const isect = this.canvas.mouseIntersectionTest(event);
                if (isect != null && isect.face == this.mouseDownIsect.face) {
                  const u = Math.floor(isect.uv[0] * cube3d.cube.layerCount);
                  const v = Math.floor(isect.uv[1] * cube3d.cube.layerCount);
                  const du = isect.uv[0] - this.mouseDownIsect.uv[0];
                  const dv = isect.uv[1] - this.mouseDownIsect.uv[1];
                  const swipeAngle = Math.atan2(dv, du) * 180 / Math.PI + 180;
                  const swipeDirection = Math.round((swipeAngle) / 90) % 4;
                  const face = isect.face;
                  const axis = cube3d.boxSwipeToAxisMap[face][swipeDirection];
                  const layerMask = cube3d.boxSwipeToLayerMap[face][u][v][swipeDirection];
                  let angle = cube3d.boxSwipeToAngleMap[face][swipeDirection];
                  if (event.shiftKey || event.metaKey) {
                    angle = 2 * angle;
                  }
                  const cube = cube3d.getCube();
                  const move = new AST.MoveNode(cube.getLayerCount(), axis, layerMask, angle);
                  this.canvas.pushMove(move);
                  move.applyTo(this.canvas.cube);
                  if (this.canvas.cube.isSolved()) {
                    this.canvas.wobble();
                  }
                  this.isCubeSwipe = false;
                  this.isMouseDrag = false;
                }
              }
            } else {
              const rm = new J3DIMatrix4();
              rm.rotate(dy, 0, 1, 0);
              rm.rotate(dx, 1, 0, 0);
              const v = rm.loghat().divide(Math.max(0.1, mouseTimestep));
              rm.multiply(this.canvas.rotationMatrix);
              this.canvas.rotationMatrix.load(rm);
              const self = this;
              let start = new Date().getTime();
              const damping = 1;
              const f = function () {
                if (self.canvas.smoothRotationFunction != f) { return; }
                const now = new Date().getTime();
                const h = (now - start) / 1000;
                if (Math.abs(v.norm()) < 0.1) {
                  self.canvas.smoothRotationFunction = null;
                } else {
                  const rm = new J3DIVector3(v).multiply(h).exphat();
                  rm.multiply(self.canvas.rotationMatrix);
                  self.canvas.rotationMatrix.load(rm);
                  const vv = new J3DIVector3(v);
                  if (h * damping < 1) {
                    v.subtract(vv.multiply(h * damping));
                  } else {
                    v.load(0, 0, 0);
                  }
                  self.canvas.repaint(f);
                }
                start = now;
              };
              this.canvas.smoothRotationFunction = f;
              this.canvas.repaint(f);
            }
            this.mousePrevX = event.clientX;
            this.mousePrevY = event.clientY;
            this.mousePrevTimeStamp = event.timeStamp;
          }
        }

        onMouseOut(event) {
          this.isMouseDrag = false;
        }

        onMouseUp(event) {
          this.isMouseDrag = false;
          this.isCubeSwipe = false;
          if (this.mouseDownX != event.clientX || this.mouseDownY != event.clientY) {
            return;
          }
          const cube3d = this.canvas.cube3d;
          if (cube3d != null && cube3d.isTwisting) {
            return;
          }
          const isect = this.canvas.mouseIntersectionTest(event);
          if (isect != null) {
            if (event.altKey || event.ctrlKey) {
              isect.angle *= -1;
            }
            if (event.shiftKey || event.metaKey) {
              isect.angle *= 2;
            }
            const cube = cube3d.getCube();
            const move = new AST.MoveNode(cube.getLayerCount(), isect.axis, isect.layerMask, isect.angle);
            this.canvas.pushMove(move);
            move.applyTo(this.canvas.cube);
            if (this.canvas.cube.isSolved()) {
              this.canvas.wobble();
            }
          }
          this.mousePrevX = undefined;
          this.mousePrevY = undefined;
          this.canvas.repaint();
        }
      }
      return {
        AbstractPlayerApplet: AbstractPlayerApplet,
        Cube3DHandler: Cube3DHandler
      };
    }
    );
    'use strict';
    define('AbstractPocketCubeCube3D', ['Cube3D', 'PocketCube', 'CubeAttributes', 'SplineInterpolator', 'J3DI', 'Node3D'],
      function (Cube3D, PocketCube, CubeAttributes, SplineInterpolator, J3DI, Node3D) {
        class AbstractPocketCubeCube3D extends Cube3D.Cube3D {
          constructor(partSize) {
            super();
            this.cornerCount = 8;
            this.edgeCount = 0;
            this.sideCount = 0;
            this.centerCount = 1;
            this.partCount = 8 + 0 + 0 + 1;
            this.cornerOffset = 0;
            this.edgeOffset = 8;
            this.sideOffset = 8;
            this.centerOffset = 8;
            this.stickerCount = 4 * 6;
            this.cube = PocketCube.newPocketCube();
            this.cube.addCubeListener(this);
            this.attributes = this.createAttributes();
            this.partToStickerMap = new Array(this.partCount);
            for (var i = 0; i < this.partCount; i++) {
              this.parts[i] = new Node3D.Node3D();
              this.partOrientations[i] = new Node3D.Node3D();
              this.partExplosions[i] = new Node3D.Node3D();
              this.partLocations[i] = new Node3D.Node3D();
              this.partOrientations[i].add(this.parts[i]);
              this.partExplosions[i].add(this.partOrientations[i]);
              this.partLocations[i].add(this.partExplosions[i]);
              this.add(this.partLocations[i]);
              this.identityPartLocations[i] = new J3DIMatrix4();
              this.partToStickerMap[i] = new Array(3);
            }
            for (var i = 0; i < this.stickerCount; i++) {
              this.partToStickerMap[this.stickerToPartMap[i]][this.stickerToFaceMap[i]] = i;
              this.stickers[i] = new Node3D.Node3D();
              this.stickerOrientations[i] = new Node3D.Node3D();
              this.stickerExplosions[i] = new Node3D.Node3D();
              this.stickerLocations[i] = new Node3D.Node3D();
              this.stickerTranslations[i] = new Node3D.Node3D();
              this.stickerOrientations[i].add(this.stickers[i]);
              this.stickerExplosions[i].add(this.stickerOrientations[i]);
              this.stickerLocations[i].add(this.stickerExplosions[i]);
              this.stickerTranslations[i].add(this.stickerLocations[i]);
              this.add(this.stickerTranslations[i]);
              this.developedStickers[i] = new Node3D.Node3D();
              this.currentStickerTransforms[i] = new Node3D.Node3D();
              this.add(this.currentStickerTransforms[i]);
              this.identityStickerLocations[i] = new J3DIMatrix4();
            }
            this.partSize = 2.0;
            const cornerOffset = this.cornerOffset;
            this.identityPartLocations[cornerOffset + 1].rotate(180, 0, 0, 1);
            this.identityPartLocations[cornerOffset + 1].rotate(90, 0, 1, 0);
            this.identityPartLocations[cornerOffset + 2].rotate(270, 0, 1, 0);
            this.identityPartLocations[cornerOffset + 3].rotate(180, 0, 0, 1);
            this.identityPartLocations[cornerOffset + 3].rotate(180, 0, 1, 0);
            this.identityPartLocations[cornerOffset + 4].rotate(180, 0, 1, 0);
            this.identityPartLocations[cornerOffset + 5].rotate(180, 1, 0, 0);
            this.identityPartLocations[cornerOffset + 5].rotate(90, 0, 1, 0);
            this.identityPartLocations[cornerOffset + 6].rotate(90, 0, 1, 0);
            this.identityPartLocations[cornerOffset + 7].rotate(180, 0, 0, 1);
            for (var i = 0; i < this.partCount; i++) {
              this.partLocations[i].matrix.load(this.identityPartLocations[i]);
            }
          }

          loadGeometry() {
            const self = this;
            const fRepaint = function () {
              self.repaint();
            };
            const modelUrl = this.getModelUrl();
            this.centerObj = J3DI.loadObj(null, modelUrl + 'center.obj', fRepaint);
            this.cornerObj = J3DI.loadObj(null, modelUrl + 'corner.obj', fRepaint);
            this.stickerObjs = new Array(this.stickerCount);
            for (let i = 0; i < this.stickerObjs.length; i++) {
              this.stickerObjs[i] = J3DI.newJ3DIObj();
            }
            this.corner_rObj = J3DI.loadObj(null, modelUrl + 'corner_r.obj', function () {
              self.initAbstractPocketCubeCube3D_corner_r();
              self.repaint();
            });
            this.corner_uObj = J3DI.loadObj(null, modelUrl + 'corner_u.obj', function () {
              self.initAbstractPocketCubeCube3D_corner_u();
              self.repaint();
            });
            this.corner_fObj = J3DI.loadObj(null, modelUrl + 'corner_f.obj', function () {
              self.initAbstractPocketCubeCube3D_corner_f();
              self.repaint();
            });
          }

          validateAttributes() {
            if (!this.isAttributesValid) {
              this.isAttributesValid = true;
              for (let i = 0; i < this.stickerObjs.length; i++) {
                this.stickerObjs[i].hasTexture = this.attributes.stickersImageURL != null;
              }
            }
          }

          initAbstractPocketCubeCube3D_corner_r() {
            const s = this.corner_rObj;
            const s180 = new J3DI.J3DIObj();
            s180.setTo(s);
            s180.rotateTexture(180);
            this.stickerObjs[0] = s.clone();
            this.stickerObjs[3] = s180.clone();
            this.stickerObjs[8] = s.clone();
            this.stickerObjs[11] = s180.clone();
            this.stickerObjs[12] = s.clone();
            this.stickerObjs[15] = s180.clone();
            this.stickerObjs[20] = s.clone();
            this.stickerObjs[23] = s180.clone();
            this.initAbstractPocketCubeCube3D_textureScales();
          }

          initAbstractPocketCubeCube3D_corner_f() {
            const s = this.corner_fObj;
            const s180 = new J3DI.J3DIObj();
            s180.setTo(s);
            s180.rotateTexture(180);
            this.stickerObjs[1] = s.clone();
            this.stickerObjs[2] = s180.clone();
            this.stickerObjs[9] = s.clone();
            this.stickerObjs[10] = s180.clone();
            this.stickerObjs[13] = s.clone();
            this.stickerObjs[14] = s180.clone();
            this.stickerObjs[21] = s.clone();
            this.stickerObjs[22] = s180.clone();
            this.initAbstractPocketCubeCube3D_textureScales();
          }

          initAbstractPocketCubeCube3D_corner_u() {
            const s = this.corner_uObj;
            const s90 = new J3DI.J3DIObj();
            s90.setTo(s);
            s90.rotateTexture(90);
            const s180 = new J3DI.J3DIObj();
            s180.setTo(s);
            s180.rotateTexture(180);
            const s270 = new J3DI.J3DIObj();
            s270.setTo(s);
            s270.rotateTexture(270);
            this.stickerObjs[4] = s180.clone();
            this.stickerObjs[5] = s90.clone();
            this.stickerObjs[6] = s270.clone();
            this.stickerObjs[7] = s.clone();
            this.stickerObjs[16] = s180.clone();
            this.stickerObjs[17] = s90.clone();
            this.stickerObjs[18] = s270.clone();
            this.stickerObjs[19] = s.clone();
            this.initAbstractPocketCubeCube3D_textureScales();
          }

          initAbstractPocketCubeCube3D_textureScales() {
            const attr = this.attributes;
            for (let i = 0; i < this.stickerObjs.length; i++) {
              if (!this.stickerObjs[i].loaded) { continue; }
              if (this.stickerObjs[i].isTextureScaled) { continue; }
              if (i * 2 + 1 < this.stickerOffsets.length) {
                this.stickerObjs[i].textureOffsetX = this.stickerOffsets[i * 2];
                this.stickerObjs[i].textureOffsetY = this.stickerOffsets[i * 2 + 1];
              }
              this.stickerObjs[i].textureScale = 84 / 512;
              this.stickerObjs[i].isTextureScaled = true;
            }
            this.isAttributesValid = false;
          }

          getPartIndexForStickerIndex(stickerIndex) {
            return stickerToPartMap[stickerIndex];
          }

          getStickerIndexForPartIndex(partIndex, orientationIndex) {
            return this.partToStickerMap[partIndex][orientationIndex];
          }

          createAttributes() {
            const a = CubeAttributes.newCubeAttributes(this.partCount, 6 * 4, [4, 4, 4, 4, 4, 4]);
            const partsPhong = [0.5, 0.6, 0.4, 16.0];
            for (var i = 0; i < this.partCount; i++) {
              a.partsFillColor[i] = [40, 40, 40, 255];
              a.partsPhong[i] = partsPhong;
            }
            a.partsFillColor[this.centerOffset] = [240, 240, 240, 255];
            const faceColors = [
              [255, 210, 0, 255],
              [0, 51, 115, 255],
              [140, 0, 15, 255],
              [248, 248, 248, 255],
              [0, 115, 47, 255],
              [255, 70, 0, 255]
            ];
            const stickersPhong = [0.8, 0.2, 0.1, 8.0];
            for (var i = 0; i < 6; i++) {
              for (let j = 0; j < 4; j++) {
                a.stickersFillColor[i * 4 + j] = faceColors[i];
                a.stickersPhong[i * 4 + j] = stickersPhong;
              }
            }
            return a;
          }

          updateExplosionFactor(factor) {
            if (factor == null) {
              factor = this.attributes.explosionFactor;
            }
            const explosionShift = this.partSize * 1.5;
            const baseShift = explosionShift * factor;
            let shift = 0;
            const a = this.attributes;
            for (let i = 0; i < this.cornerCount; i++) {
              const index = this.cornerOffset + i;
              shift = baseShift + a.partExplosion[index];
              this.partExplosions[index].matrix.makeIdentity();
              this.partExplosions[index].matrix.translate(shift, shift, -shift);
            }
            this.fireStateChanged();
          }

          validateTwist(partIndices, locations, orientations, length, axis, angle, alpha) {
            const rotation = this.updateTwistRotation;
            rotation.makeIdentity();
            const rad = (90 * angle * (1 - alpha));
            switch (axis) {
              case 0:
                rotation.rotate(rad, -1, 0, 0);
                break;
              case 1:
                rotation.rotate(rad, 0, -1, 0);
                break;
              case 2:
                rotation.rotate(rad, 0, 0, 1);
                break;
            }
            const orientationMatrix = this.updateTwistOrientation;
            for (let i = 0; i < length; i++) {
              orientationMatrix.makeIdentity();
              if (partIndices[i] < this.edgeOffset) {
                switch (orientations[i]) {
                  case 0:
                    break;
                  case 1:
                    orientationMatrix.rotate(90, 0, 0, 1);
                    orientationMatrix.rotate(90, -1, 0, 0);
                    break;
                  case 2:
                    orientationMatrix.rotate(90, 0, 0, -1);
                    orientationMatrix.rotate(90, 0, 1, 0);
                    break;
                }
              }
              this.partOrientations[partIndices[i]].matrix.load(orientationMatrix);
              const transform = this.partLocations[partIndices[i]].matrix;
              transform.load(rotation);
              transform.multiply(this.identityPartLocations[locations[i]]);
            }
          }

          cubeTwisted(evt) {
            if (this.repainter == null) {
              this.updateCube();
              return;
            }
            const layerMask = evt.layerMask;
            const axis = evt.axis;
            const angle = evt.angle;
            const model = this.cube;
            const partIndices = new Array(27);
            let locations = new Array(27);
            const orientations = new Array(27);
            let count = 0;
            const affectedParts = evt.getAffectedLocations();
            count = affectedParts.length;
            locations = affectedParts.slice(0, count);
            for (let i = 0; i < count; i++) {
              partIndices[i] = model.getPartAt(locations[i]);
              orientations[i] = model.getPartOrientation(partIndices[i]);
            }
            const finalCount = count;
            const self = this;
            const interpolator = SplineInterpolator.newSplineInterpolator(0, 0, 1, 1);
            const start = new Date().getTime();
            const duration = this.attributes.twistDuration * Math.abs(angle);
            this.isTwisting = true;
            var f = function () {
              const now = new Date().getTime();
              const elapsed = now - start;
              const value = elapsed / duration;
              if (value < 1) {
                self.validateTwist(partIndices, locations, orientations, finalCount, axis, angle, interpolator.getFraction(value));
                self.repainter.repaint(f);
              } else {
                self.validateTwist(partIndices, locations, orientations, finalCount, axis, angle, 1.0);
                self.isTwisting = false;
              }
            };
            this.repainter.repaint(f);
          }
        }
        AbstractPocketCubeCube3D.prototype.stickerToPartMap = [
          0, 2, 1, 3,
          4, 2, 6, 0,
          6, 0, 7, 1,
          4, 6, 5, 7,
          7, 1, 5, 3,
          2, 4, 3, 5
        ];
        AbstractPocketCubeCube3D.prototype.partToStickerMap = null;
        AbstractPocketCubeCube3D.prototype.stickerToFaceMap = [
          1, 2, 2, 1,
          0, 0, 0, 0,
          1, 2, 2, 1,
          1, 2, 2, 1,
          0, 0, 0, 0,
          1, 2, 2, 1
        ];
        AbstractPocketCubeCube3D.prototype.boxClickToLocationMap = [
          [[7, 6], [5, 4]],
          [[7, 5], [1, 3]],
          [[7, 6], [1, 0]],
          [[1, 0], [3, 2]],
          [[6, 4], [0, 2]],
          [[5, 4], [3, 2]]
        ];
        AbstractPocketCubeCube3D.prototype.boxClickToAxisMap = [
          [[0, 0], [0, 0]],
          [[1, 1], [1, 1]],
          [[2, 2], [2, 2]],
          [[0, 0], [0, 0]],
          [[1, 1], [1, 1]],
          [[2, 2], [2, 2]]
        ];
        AbstractPocketCubeCube3D.prototype.boxClickToAngleMap = [
          [[-1, -1], [-1, -1]],
          [[-1, -1], [-1, -1]],
          [[1, 1], [1, 1]],
          [[1, 1], [1, 1]],
          [[1, 1], [1, 1]],
          [[-1, -1], [-1, -1]]
        ];
        AbstractPocketCubeCube3D.prototype.boxClickToLayerMap = [
          [[1, 1], [1, 1]],
          [[1, 1], [1, 1]],
          [[2, 2], [2, 2]],
          [[2, 2], [2, 2]],
          [[2, 2], [2, 2]],
          [[1, 1], [1, 1]]
        ];
        AbstractPocketCubeCube3D.prototype.boxSwipeToAxisMap = [
          [1, 2, 1, 2],
          [2, 0, 2, 0],
          [1, 0, 1, 0],
          [1, 2, 1, 2],
          [2, 0, 2, 0],
          [1, 0, 1, 0]
        ];
        AbstractPocketCubeCube3D.prototype.boxSwipeToAngleMap = [
          [-1, -1, 1, 1],
          [1, 1, -1, -1],
          [1, -1, -1, 1],
          [1, 1, -1, -1],
          [-1, -1, 1, 1],
          [-1, 1, 1, -1]
        ];
        AbstractPocketCubeCube3D.prototype.boxSwipeToLayerMap = [
          [[[1, 2, 1, 2], [2, 2, 2, 2]], [[1, 1, 1, 1], [2, 1, 2, 1]]],
          [[[2, 1, 2, 1], [1, 1, 1, 1]], [[2, 2, 2, 2], [1, 2, 1, 2]]],
          [[[1, 1, 1, 1], [2, 1, 2, 1]], [[1, 2, 1, 2], [2, 2, 2, 2]]],
          [[[1, 2, 1, 2], [2, 2, 2, 2]], [[1, 1, 1, 1], [2, 1, 2, 1]]],
          [[[2, 1, 2, 1], [1, 1, 1, 1]], [[2, 2, 2, 2], [1, 2, 1, 2]]],
          [[[1, 1, 1, 1], [2, 1, 2, 1]], [[1, 2, 1, 2], [2, 2, 2, 2]]]
        ];
        AbstractPocketCubeCube3D.prototype.stickerOffsets = [
          4, 2, 5, 2,
          4, 3, 5, 3,
          2, 0, 3, 0,
          2, 1, 3, 1,
          2, 2, 3, 2,
          2, 3, 3, 3,
          0, 2, 1, 2,
          0, 3, 1, 3,
          2, 4, 3, 4,
          2, 5, 3, 5,
          4, 4, 5, 4,
          4, 5, 5, 5
        ];
        return {
          AbstractPocketCubeCube3D: AbstractPocketCubeCube3D
        };
      });
    'use strict';
    define('AbstractRubiksCubeCube3D', ['Cube3D', 'RubiksCube', 'CubeAttributes', 'SplineInterpolator', 'J3DI', 'Node3D'],
      function (Cube3D, RubiksCube, CubeAttributes, SplineInterpolator, J3DI, Node3D) {
        const module = {
          log: (false) ? console.log : () => {},
          info: (true) ? console.info : () => {},
          warning: (true) ? console.warning : () => {},
          error: (true) ? console.error : () => {}
        };
        class AbstractRubiksCubeCube3D extends Cube3D.Cube3D {
          constructor(partSize) {
            super();
            this.cornerCount = 8;
            this.edgeCount = 12;
            this.sideCount = 6;
            this.centerCount = 1;
            this.partCount = 8 + 12 + 6 + 1;
            this.cornerOffset = 0;
            this.edgeOffset = 8;
            this.sideOffset = 8 + 12;
            this.centerOffset = 8 + 12 + 6;
            this.cube = new RubiksCube.RubiksCube();
            this.cube.addCubeListener(this);
            this.attributes = this.createAttributes();
            this.partToStickerMap = new Array(this.partCount);
            for (var i = 0; i < this.partCount; i++) {
              this.parts[i] = new Node3D.Node3D();
              this.partOrientations[i] = new Node3D.Node3D();
              this.partExplosions[i] = new Node3D.Node3D();
              this.partLocations[i] = new Node3D.Node3D();
              this.partOrientations[i].add(this.parts[i]);
              this.partExplosions[i].add(this.partOrientations[i]);
              this.partLocations[i].add(this.partExplosions[i]);
              this.add(this.partLocations[i]);
              this.identityPartLocations[i] = new J3DIMatrix4();
              this.partToStickerMap[i] = new Array(3);
            }
            this.stickerCount = 9 * 6;
            for (var i = 0; i < this.stickerCount; i++) {
              this.partToStickerMap[this.stickerToPartMap[i]][this.stickerToFaceMap[i]] = i;
              this.stickers[i] = new Node3D.Node3D();
              this.stickerOrientations[i] = new Node3D.Node3D();
              this.stickerExplosions[i] = new Node3D.Node3D();
              this.stickerLocations[i] = new Node3D.Node3D();
              this.stickerTranslations[i] = new Node3D.Node3D();
              this.stickerOrientations[i].add(this.stickers[i]);
              this.stickerExplosions[i].add(this.stickerOrientations[i]);
              this.stickerLocations[i].add(this.stickerExplosions[i]);
              this.stickerTranslations[i].add(this.stickerLocations[i]);
              this.add(this.stickerTranslations[i]);
              this.developedStickers[i] = new Node3D.Node3D();
              this.currentStickerTransforms[i] = new Node3D.Node3D();
              this.add(this.currentStickerTransforms[i]);
              this.identityStickerLocations[i] = new J3DIMatrix4();
            }
            this.partSize = (partSize === undefined) ? 2.0 : partSize;
            const cornerOffset = this.cornerOffset;
            const ps = this.partSize;
            this.identityPartLocations[cornerOffset + 1].rotate(180, 0, 0, 1);
            this.identityPartLocations[cornerOffset + 1].rotate(90, 0, 1, 0);
            this.identityPartLocations[cornerOffset + 2].rotate(270, 0, 1, 0);
            this.identityPartLocations[cornerOffset + 3].rotate(180, 0, 0, 1);
            this.identityPartLocations[cornerOffset + 3].rotate(180, 0, 1, 0);
            this.identityPartLocations[cornerOffset + 4].rotate(180, 0, 1, 0);
            this.identityPartLocations[cornerOffset + 5].rotate(180, 1, 0, 0);
            this.identityPartLocations[cornerOffset + 5].rotate(90, 0, 1, 0);
            this.identityPartLocations[cornerOffset + 6].rotate(90, 0, 1, 0);
            this.identityPartLocations[cornerOffset + 7].rotate(180, 0, 0, 1);
            this.stickers[0].matrix.rotate(-90, 0, 1, 0);
            this.stickers[0].matrix.rotate(90, 0, 0, 1);
            this.stickers[20].matrix.rotate(90, 0, 1, 0);
            this.stickers[20].matrix.rotate(90, 1, 0, 0);
            this.stickers[26].matrix.rotate(-90, 0, 1, 0);
            this.stickers[26].matrix.rotate(90, 0, 0, 1);
            this.stickers[6].matrix.rotate(90, 0, 1, 0);
            this.stickers[6].matrix.rotate(90, 1, 0, 0);
            this.stickers[45].matrix.rotate(-90, 0, 1, 0);
            this.stickers[45].matrix.rotate(90, 0, 0, 1);
            this.stickers[2].matrix.rotate(90, 0, 1, 0);
            this.stickers[2].matrix.rotate(90, 1, 0, 0);
            this.stickers[8].matrix.rotate(-90, 0, 1, 0);
            this.stickers[8].matrix.rotate(90, 0, 0, 1);
            this.stickers[51].matrix.rotate(90, 0, 1, 0);
            this.stickers[51].matrix.rotate(90, 1, 0, 0);
            this.stickers[27].matrix.rotate(-90, 0, 1, 0);
            this.stickers[27].matrix.rotate(90, 0, 0, 1);
            this.stickers[47].matrix.rotate(90, 0, 1, 0);
            this.stickers[47].matrix.rotate(90, 1, 0, 0);
            this.stickers[53].matrix.rotate(-90, 0, 1, 0);
            this.stickers[53].matrix.rotate(90, 0, 0, 1);
            this.stickers[33].matrix.rotate(90, 0, 1, 0);
            this.stickers[33].matrix.rotate(90, 1, 0, 0);
            this.stickers[18].matrix.rotate(-90, 0, 1, 0);
            this.stickers[18].matrix.rotate(90, 0, 0, 1);
            this.stickers[29].matrix.rotate(90, 0, 1, 0);
            this.stickers[29].matrix.rotate(90, 1, 0, 0);
            this.stickers[35].matrix.rotate(-90, 0, 1, 0);
            this.stickers[35].matrix.rotate(90, 0, 0, 1);
            this.stickers[24].matrix.rotate(90, 0, 1, 0);
            this.stickers[24].matrix.rotate(90, 1, 0, 0);
            this.identityStickerLocations[17].translate(0, ps * 3, 0);
            this.identityStickerLocations[17].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[0].translate(ps * 3, 0, 0);
            this.identityStickerLocations[0].rotate(180, 0, 0, 1);
            this.identityStickerLocations[0].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[20].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[20].rotate(-90, 0, 1, 0);
            this.identityStickerLocations[38].translate(0, ps * -3, 0);
            this.identityStickerLocations[38].rotate(90, 0, 0, 1);
            this.identityStickerLocations[38].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[26].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[6].translate(ps * 3, 0, 0);
            this.identityStickerLocations[6].rotate(-90, 0, 0, 1);
            this.identityStickerLocations[6].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[11].translate(0, ps * 3, 0);
            this.identityStickerLocations[11].rotate(90, 0, 0, 1);
            this.identityStickerLocations[11].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[45].translate(ps * 6, 0, 0);
            this.identityStickerLocations[45].rotate(180, 0, 0, 1);
            this.identityStickerLocations[45].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[2].translate(ps * 3, 0, 0);
            this.identityStickerLocations[2].rotate(90, 0, 0, 1);
            this.identityStickerLocations[2].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[44].translate(0, ps * -3, 0);
            this.identityStickerLocations[44].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[8].translate(ps * 3, 0, 0);
            this.identityStickerLocations[8].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[51].translate(ps * 6, 0, 0);
            this.identityStickerLocations[51].rotate(-90, 0, 0, 1);
            this.identityStickerLocations[51].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[9].translate(0, ps * 3, 0);
            this.identityStickerLocations[9].rotate(180, 0, 0, 1);
            this.identityStickerLocations[9].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[27].translate(ps * -3, 0, 0);
            this.identityStickerLocations[27].rotate(180, 0, 0, 1);
            this.identityStickerLocations[27].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[47].translate(ps * 6, 0, 0);
            this.identityStickerLocations[47].rotate(90, 0, 0, 1);
            this.identityStickerLocations[47].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[42].translate(0, ps * -3, 0);
            this.identityStickerLocations[42].rotate(-90, 0, 0, 1);
            this.identityStickerLocations[42].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[53].translate(ps * 6, 0, 0);
            this.identityStickerLocations[53].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[33].translate(ps * -3, 0, 0);
            this.identityStickerLocations[33].rotate(-90, 0, 0, 1);
            this.identityStickerLocations[33].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[15].translate(0, ps * 3, 0);
            this.identityStickerLocations[15].rotate(-90, 0, 0, 1);
            this.identityStickerLocations[15].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[18].rotate(180, 0, 0, 1);
            this.identityStickerLocations[18].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[29].translate(ps * -3, 0, 0);
            this.identityStickerLocations[29].rotate(90, 0, 0, 1);
            this.identityStickerLocations[29].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[36].translate(0, ps * -3, 0);
            this.identityStickerLocations[36].rotate(180, 0, 0, 1);
            this.identityStickerLocations[36].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[35].translate(ps * -3, 0, 0);
            this.identityStickerLocations[35].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[24].rotate(-90, 0, 0, 1);
            this.identityStickerLocations[24].rotate(-90, 1, 0, 0);
            const edgeOffset = this.edgeOffset;
            this.identityPartLocations[edgeOffset + 1].rotate(90, 0, 0, -1);
            this.identityPartLocations[edgeOffset + 1].rotate(90, 0, 1, 0);
            this.identityPartLocations[edgeOffset + 2].rotate(180, 1, 0, 0);
            this.identityPartLocations[edgeOffset + 3].rotate(90, 0, 0, 1);
            this.identityPartLocations[edgeOffset + 3].rotate(90, 1, 0, 0);
            this.identityPartLocations[edgeOffset + 4].rotate(90, 0, 0, -1);
            this.identityPartLocations[edgeOffset + 4].rotate(90, 0, -1, 0);
            this.identityPartLocations[edgeOffset + 5].rotate(90, 1, 0, 0);
            this.identityPartLocations[edgeOffset + 5].rotate(90, 0, -1, 0);
            this.identityPartLocations[edgeOffset + 6].rotate(180, 0, 1, 0);
            this.identityPartLocations[edgeOffset + 7].rotate(90, 0, 0, 1);
            this.identityPartLocations[edgeOffset + 7].rotate(90, 0, -1, 0);
            this.identityPartLocations[edgeOffset + 8].rotate(180, 0, 1, 0);
            this.identityPartLocations[edgeOffset + 8].rotate(180, 1, 0, 0);
            this.identityPartLocations[edgeOffset + 9].rotate(-90, 1, 0, 0);
            this.identityPartLocations[edgeOffset + 9].rotate(90, 0, -1, 0);
            this.identityPartLocations[edgeOffset + 10].rotate(90, 0, 1, 0);
            this.identityPartLocations[edgeOffset + 10].rotate(-90, 1, 0, 0);
            this.identityPartLocations[edgeOffset + 11].rotate(90, 0, 0, -1);
            this.identityPartLocations[edgeOffset + 11].rotate(-90, 1, 0, 0);
            this.stickers[1].matrix.rotate(180, 0, 1, 0);
            this.stickers[1].matrix.rotate(90, 0, 0, 1);
            this.stickers[23].matrix.rotate(180, 0, 1, 0);
            this.stickers[23].matrix.rotate(90, 0, 0, 1);
            this.stickers[7].matrix.rotate(180, 0, 1, 0);
            this.stickers[7].matrix.rotate(90, 0, 0, 1);
            this.stickers[10].matrix.rotate(180, 0, 1, 0);
            this.stickers[10].matrix.rotate(90, 0, 0, 1);
            this.stickers[48].matrix.rotate(180, 0, 1, 0);
            this.stickers[48].matrix.rotate(90, 0, 0, 1);
            this.stickers[43].matrix.rotate(180, 0, 1, 0);
            this.stickers[43].matrix.rotate(90, 0, 0, 1);
            this.stickers[28].matrix.rotate(180, 0, 1, 0);
            this.stickers[28].matrix.rotate(90, 0, 0, 1);
            this.stickers[50].matrix.rotate(180, 0, 1, 0);
            this.stickers[50].matrix.rotate(90, 0, 0, 1);
            this.stickers[34].matrix.rotate(180, 0, 1, 0);
            this.stickers[34].matrix.rotate(90, 0, 0, 1);
            this.stickers[16].matrix.rotate(180, 0, 1, 0);
            this.stickers[16].matrix.rotate(90, 0, 0, 1);
            this.stickers[21].matrix.rotate(180, 0, 1, 0);
            this.stickers[21].matrix.rotate(90, 0, 0, 1);
            this.stickers[37].matrix.rotate(180, 0, 1, 0);
            this.stickers[37].matrix.rotate(90, 0, 0, 1);
            this.identityStickerLocations[14].translate(0, ps * 3, 0);
            this.identityStickerLocations[14].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[1].translate(ps * 3, 0, 0);
            this.identityStickerLocations[1].rotate(90, 0, 0, 1);
            this.identityStickerLocations[1].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[3].translate(ps * 3, 0, 0);
            this.identityStickerLocations[3].rotate(180, 0, 0, 1);
            this.identityStickerLocations[3].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[23].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[41].translate(0, ps * -3, 0);
            this.identityStickerLocations[41].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[7].translate(ps * 3, 0, 0);
            this.identityStickerLocations[7].rotate(-90, 0, 0, 1);
            this.identityStickerLocations[7].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[46].translate(ps * 6, ps * 0, 0);
            this.identityStickerLocations[46].rotate(90, 0, 0, 1);
            this.identityStickerLocations[46].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[10].translate(ps * 0, ps * 3, 0);
            this.identityStickerLocations[10].rotate(90, 0, 0, 1);
            this.identityStickerLocations[10].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[5].translate(ps * 3, 0, 0);
            this.identityStickerLocations[5].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[48].translate(ps * 6, 0, 0);
            this.identityStickerLocations[48].rotate(180, 0, 0, 1);
            this.identityStickerLocations[48].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[52].translate(ps * 6, ps * 0, 0);
            this.identityStickerLocations[52].rotate(90, 0, 0, -1);
            this.identityStickerLocations[52].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[43].translate(ps * 0, ps * -3, 0);
            this.identityStickerLocations[43].rotate(-90, 0, 0, 1);
            this.identityStickerLocations[43].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[12].translate(ps * 0, ps * 3, 0);
            this.identityStickerLocations[12].rotate(180, 0, 0, 1);
            this.identityStickerLocations[12].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[28].translate(ps * -3, ps * 0, 0);
            this.identityStickerLocations[28].rotate(90, 0, 0, 1);
            this.identityStickerLocations[28].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[30].translate(ps * -3, ps * 0, 0);
            this.identityStickerLocations[30].rotate(180, 0, 0, 1);
            this.identityStickerLocations[30].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[50].translate(ps * 6, ps * 0, 0);
            this.identityStickerLocations[50].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[39].translate(ps * 0, ps * -3, 0);
            this.identityStickerLocations[39].rotate(180, 0, 0, 1);
            this.identityStickerLocations[39].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[34].translate(ps * -3, ps * 0, 0);
            this.identityStickerLocations[34].rotate(-90, 0, 0, 1);
            this.identityStickerLocations[34].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[19].translate(ps * 0, ps * -0, 0);
            this.identityStickerLocations[19].rotate(90, 0, 0, 1);
            this.identityStickerLocations[19].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[16].translate(ps * 0, ps * 3, 0);
            this.identityStickerLocations[16].rotate(-90, 0, 0, 1);
            this.identityStickerLocations[16].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[32].translate(ps * -3, ps * -0, 0);
            this.identityStickerLocations[32].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[21].rotate(180, 0, 0, 1);
            this.identityStickerLocations[21].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[25].rotate(90, 0, 0, -1);
            this.identityStickerLocations[25].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[37].translate(ps * 0, ps * -3, 0);
            this.identityStickerLocations[37].rotate(90, 0, 0, 1);
            this.identityStickerLocations[37].rotate(-90, 1, 0, 0);
            const sideOffset = this.sideOffset;
            this.identityPartLocations[sideOffset + 1].rotate(90, 0, 0, 1);
            this.identityPartLocations[sideOffset + 1].rotate(-90, 1, 0, 0);
            this.identityPartLocations[sideOffset + 2].rotate(90, 0, 1, 0);
            this.identityPartLocations[sideOffset + 2].rotate(90, 1, 0, 0);
            this.identityPartLocations[sideOffset + 3].rotate(180, 0, 1, 0);
            this.identityPartLocations[sideOffset + 3].rotate(-90, 1, 0, 0);
            this.identityPartLocations[sideOffset + 4].rotate(90, 0, 0, -1);
            this.identityPartLocations[sideOffset + 4].rotate(180, 1, 0, 0);
            this.identityPartLocations[sideOffset + 5].rotate(90, 0, -1, 0);
            this.identityPartLocations[sideOffset + 5].rotate(180, 1, 0, 0);
            this.identityStickerLocations[4].translate(3 * partSize, 0, 0);
            this.identityStickerLocations[4].rotate(90, 0, 1, 0);
            this.identityStickerLocations[13].translate(0, 3 * partSize, 0);
            this.identityStickerLocations[13].rotate(90, 0, 1, 0);
            this.identityStickerLocations[13].rotate(180, 1, 0, 0);
            this.identityStickerLocations[22].rotate(90, 0, 1, 0);
            this.identityStickerLocations[22].rotate(90, 1, 0, 0);
            this.identityStickerLocations[31].translate(-3 * partSize, 0, 0);
            this.identityStickerLocations[31].rotate(90, 0, 1, 0);
            this.identityStickerLocations[31].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[40].translate(0, -3 * partSize, 0);
            this.identityStickerLocations[40].rotate(90, 0, 1, 0);
            this.identityStickerLocations[40].rotate(-90, 1, 0, 0);
            this.identityStickerLocations[49].translate(6 * partSize, 0, 0);
            this.identityStickerLocations[49].rotate(90, 0, 1, 0);
            this.identityStickerLocations[49].rotate(180, 1, 0, 0);
            for (var i = 0; i < this.partCount; i++) {
              this.partLocations[i].matrix.load(this.identityPartLocations[i]);
            }
            for (var i = 0; i < this.stickerCount; i++) {
              this.stickerLocations[i].matrix.load(this.identityStickerLocations[i]);
            }
          }

          loadGeometry() {
            const self = this;
            const fRepaint = function () {
              self.repaint();
            };
            const baseUrl = this.getModelUrl();
            {
              this.centerObj = J3DI.loadObj(null, baseUrl + 'center.obj', fRepaint);
              this.cornerObj = J3DI.loadObj(null, baseUrl + 'corner.obj', fRepaint);
              this.edgeObj = J3DI.loadObj(null, baseUrl + 'edge.obj', fRepaint);
              this.sideObj = J3DI.loadObj(null, baseUrl + 'side.obj', fRepaint);
              this.stickerObjs = new Array(this.stickerCount);
              for (let i = 0; i < this.stickerObjs.length; i++) {
                this.stickerObjs[i] = new J3DI.J3DIObj();
              }
              this.corner_rObj = J3DI.loadObj(null, baseUrl + 'corner_r.obj', function () {
                self.initAbstractRubiksCubeCube3D_corner_r();
                self.repaint();
              });
              this.corner_uObj = J3DI.loadObj(null, baseUrl + 'corner_u.obj', function () {
                self.initAbstractRubiksCubeCube3D_corner_u();
                self.repaint();
              });
              this.corner_fObj = J3DI.loadObj(null, baseUrl + 'corner_f.obj', function () {
                self.initAbstractRubiksCubeCube3D_corner_f();
                self.repaint();
              });
              this.edge_rObj = J3DI.loadObj(null, baseUrl + 'edge_r.obj', function () {
                self.initAbstractRubiksCubeCube3D_edge_r();
                self.repaint();
              });
              this.edge_uObj = J3DI.loadObj(null, baseUrl + 'edge_u.obj', function () {
                self.initAbstractRubiksCubeCube3D_edge_u();
                self.repaint();
              });
              this.side_rObj = J3DI.loadObj(null, baseUrl + 'side_r.obj', function () {
                self.initAbstractRubiksCubeCube3D_side_r();
                self.repaint();
              });
            }
          }

          doValidateAttributes() {
            const a = this.attributes;
            for (let i = 0; i < this.stickerObjs.length; i++) {
              this.stickerObjs[i].hasTexture = a.stickersImageURL != null;
            }
            for (let i = 0; i < a.getPartCount(); i++) {
              this.parts[i].visible = a.isPartVisible(i);
            }
          }

          initAbstractRubiksCubeCube3D_corner_r() {
            const s = this.corner_rObj;
            const s180 = new J3DI.J3DIObj();
            s180.setTo(s);
            s180.rotateTexture(180);
            this.stickerObjs[0] = s.clone();
            this.stickerObjs[8] = s180.clone();
            this.stickerObjs[18] = s.clone();
            this.stickerObjs[26] = s180.clone();
            this.stickerObjs[27] = s.clone();
            this.stickerObjs[35] = s180.clone();
            this.stickerObjs[45] = s.clone();
            this.stickerObjs[53] = s180.clone();
            this.initAbstractRubiksCubeCube3D_textureScales();
          }

          initAbstractRubiksCubeCube3D_corner_f() {
            const s = this.corner_fObj;
            const s180 = new J3DI.J3DIObj();
            s180.setTo(s);
            s180.rotateTexture(180);
            this.stickerObjs[2] = s.clone();
            this.stickerObjs[6] = s180.clone();
            this.stickerObjs[20] = s.clone();
            this.stickerObjs[24] = s180.clone();
            this.stickerObjs[29] = s.clone();
            this.stickerObjs[33] = s180.clone();
            this.stickerObjs[47] = s.clone();
            this.stickerObjs[51] = s180.clone();
            this.initAbstractRubiksCubeCube3D_textureScales();
          }

          initAbstractRubiksCubeCube3D_corner_u() {
            const s = this.corner_uObj;
            const s90 = new J3DI.J3DIObj();
            s90.setTo(s);
            s90.rotateTexture(90);
            const s180 = new J3DI.J3DIObj();
            s180.setTo(s);
            s180.rotateTexture(180);
            const s270 = new J3DI.J3DIObj();
            s270.setTo(s);
            s270.rotateTexture(270);
            this.stickerObjs[9] = s180.clone();
            this.stickerObjs[11] = s90.clone();
            this.stickerObjs[15] = s270.clone();
            this.stickerObjs[17] = s.clone();
            this.stickerObjs[36] = s180.clone();
            this.stickerObjs[38] = s90.clone();
            this.stickerObjs[42] = s270.clone();
            this.stickerObjs[44] = s.clone();
            this.initAbstractRubiksCubeCube3D_textureScales();
          }

          initAbstractRubiksCubeCube3D_edge_u() {
            const s = this.edge_uObj;
            const s90 = new J3DI.J3DIObj();
            s90.setTo(s);
            s90.rotateTexture(90);
            const s180 = new J3DI.J3DIObj();
            s180.setTo(s);
            s180.rotateTexture(180);
            const s270 = new J3DI.J3DIObj();
            s270.setTo(s);
            s270.rotateTexture(270);
            this.stickerObjs[12] = s180.clone();
            this.stickerObjs[14] = s.clone();
            this.stickerObjs[19] = s90.clone();
            this.stickerObjs[46] = s90.clone();
            this.stickerObjs[30] = s180.clone();
            this.stickerObjs[32] = s.clone();
            this.stickerObjs[3] = s180.clone();
            this.stickerObjs[5] = s.clone();
            this.stickerObjs[25] = s270.clone();
            this.stickerObjs[52] = s270.clone();
            this.stickerObjs[39] = s180.clone();
            this.stickerObjs[41] = s.clone();
            this.initAbstractRubiksCubeCube3D_textureScales();
          }

          initAbstractRubiksCubeCube3D_edge_r() {
            const s = this.edge_rObj;
            const s90 = new J3DI.J3DIObj();
            s90.setTo(s);
            s90.rotateTexture(90);
            const s180 = new J3DI.J3DIObj();
            s180.setTo(s);
            s180.rotateTexture(180);
            const s270 = new J3DI.J3DIObj();
            s270.setTo(s);
            s270.rotateTexture(270);
            this.stickerObjs[1] = s.clone();
            this.stickerObjs[10] = s.clone();
            this.stickerObjs[16] = s180.clone();
            this.stickerObjs[28] = s.clone();
            this.stickerObjs[34] = s180.clone();
            this.stickerObjs[7] = s180.clone();
            this.stickerObjs[21] = s90.clone();
            this.stickerObjs[23] = s270.clone();
            this.stickerObjs[48] = s90.clone();
            this.stickerObjs[50] = s270.clone();
            this.stickerObjs[37] = s.clone();
            this.stickerObjs[43] = s180.clone();
            this.initAbstractRubiksCubeCube3D_textureScales();
          }

          initAbstractRubiksCubeCube3D_side_r() {
            const s = this.side_rObj;
            const s90 = s.clone();
            s90.rotateTexture(90);
            const s180 = s.clone();
            s180.rotateTexture(180);
            const s270 = s.clone();
            s270.rotateTexture(270);
            this.stickerObjs[4] = s.clone();
            this.stickerObjs[13] = s180.clone();
            this.stickerObjs[22] = s270.clone();
            this.stickerObjs[31] = s90.clone();
            this.stickerObjs[40] = s90.clone();
            this.stickerObjs[49] = s180.clone();
            this.initAbstractRubiksCubeCube3D_textureScales();
          }

          initAbstractRubiksCubeCube3D_textureScales() {
            const attr = this.attributes;
            for (let i = 0; i < this.stickerObjs.length; i++) {
              if (!this.stickerObjs[i].loaded) { continue; }
              if (this.stickerObjs[i].isTextureScaled) { continue; }
              if (i * 2 + 1 < this.stickerOffsets.length) {
                this.stickerObjs[i].textureOffsetX = this.stickerOffsets[i * 2];
                this.stickerObjs[i].textureOffsetY = this.stickerOffsets[i * 2 + 1];
              }
              this.stickerObjs[i].textureScale = 56 / 512;
              this.stickerObjs[i].isTextureScaled = true;
            }
            this.isAttributesValid = false;
          }

          getPartIndexForStickerIndex(stickerIndex) {
            return this.stickerToPartMap[stickerIndex];
          }

          getPartOrientationForStickerIndex(stickerIndex) {
            return this.stickerToFaceMap[stickerIndex];
          }

          getStickerIndexForPartIndex(partIndex, orientation) {
            return this.partToStickerMap[partIndex][orientation];
          }

          createAttributes() {
            const a = CubeAttributes.newCubeAttributes(this.partCount, 6 * 9, [9, 9, 9, 9, 9, 9]);
            const partsPhong = [0.5, 0.6, 0.4, 16.0];
            for (var i = 0; i < this.partCount; i++) {
              a.partsFillColor[i] = [40, 40, 40, 255];
              a.partsPhong[i] = partsPhong;
            }
            a.partsFillColor[this.centerOffset] = [240, 240, 240, 255];
            const faceColors = [
              [255, 210, 0, 255],
              [0, 51, 115, 255],
              [140, 0, 15, 255],
              [248, 248, 248, 255],
              [0, 115, 47, 255],
              [255, 70, 0, 255]
            ];
            const stickersPhong = [0.8, 0.2, 0.1, 8.0];
            for (var i = 0; i < 6; i++) {
              for (let j = 0; j < 9; j++) {
                a.stickersFillColor[i * 9 + j] = faceColors[i];
                a.stickersPhong[i * 9 + j] = stickersPhong;
              }
            }
            return a;
          }

          updateExplosionFactor(factor) {
            if (factor == null) {
              factor = this.attributes.explosionFactor;
            }
            const explosionShift = this.partSize * 1.5;
            const baseShift = explosionShift * factor;
            let shift = 0;
            const a = this.attributes;
            for (var i = 0; i < this.cornerCount; i++) {
              var index = this.cornerOffset + i;
              shift = baseShift + a.partExplosion[index];
              this.partExplosions[index].matrix.makeIdentity();
              this.partExplosions[index].matrix.translate(shift, shift, -shift);
            }
            for (var i = 0; i < this.edgeCount; i++) {
              var index = this.edgeOffset + i;
              shift = baseShift + a.partExplosion[index];
              this.partExplosions[index].matrix.makeIdentity();
              this.partExplosions[index].matrix.translate(shift, shift, 0);
            }
            for (var i = 0; i < this.sideCount; i++) {
              var index = this.sideOffset + i;
              shift = baseShift + a.partExplosion[index];
              this.partExplosions[index].matrix.makeIdentity();
              this.partExplosions[index].matrix.translate(shift, 0, 0);
            }
            this.fireStateChanged();
          }

          validateTwist(partIndices, locations, orientations, length, axis, angle, alpha) {
            const rotation = this.updateTwistRotation;
            rotation.makeIdentity();
            const rad = (90 * angle * (1 - alpha));
            switch (axis) {
              case 0:
                rotation.rotate(rad, -1, 0, 0);
                break;
              case 1:
                rotation.rotate(rad, 0, -1, 0);
                break;
              case 2:
                rotation.rotate(rad, 0, 0, 1);
                break;
            }
            const orientationMatrix = this.updateTwistOrientation;
            for (let i = 0; i < length; i++) {
              orientationMatrix.makeIdentity();
              if (partIndices[i] < this.edgeOffset) {
                switch (orientations[i]) {
                  case 0:
                    break;
                  case 1:
                    orientationMatrix.rotate(90, 0, 0, 1);
                    orientationMatrix.rotate(90, -1, 0, 0);
                    break;
                  case 2:
                    orientationMatrix.rotate(90, 0, 0, -1);
                    orientationMatrix.rotate(90, 0, 1, 0);
                    break;
                }
              } else if (partIndices[i] < this.sideOffset) {
                orientationMatrix.makeIdentity();
                if (orientations[i] == 1) {
                  orientationMatrix.rotate(90, 0, 0, 1);
                  orientationMatrix.rotate(180, 1, 0, 0);
                }
              } else if (partIndices[i] < this.centerOffset) {
                if (orientations[i] > 0) {
                  orientationMatrix.rotate(90 * orientations[i], -1, 0, 0);
                }
              }
              this.partOrientations[partIndices[i]].matrix.load(orientationMatrix);
              const transform = this.partLocations[partIndices[i]].matrix;
              transform.load(rotation);
              transform.multiply(this.identityPartLocations[locations[i]]);
            }
          }

          cubeTwisted(evt) {
            if (this.repainter == null) {
              this.updateCube();
              return;
            }
            const layerMask = evt.layerMask;
            const axis = evt.axis;
            const angle = evt.angle;
            const model = this.cube;
            const partIndices = new Array(27);
            let locations = new Array(27);
            const orientations = new Array(27);
            let count = 0;
            const affectedParts = evt.getAffectedLocations();
            if ((layerMask & 2) != 0) {
              count = affectedParts.length + 1;
              locations = affectedParts.slice(0, count);
              locations[count - 1] = this.centerOffset;
            } else {
              count = affectedParts.length;
              locations = affectedParts.slice(0, count);
            }
            for (let i = 0; i < count; i++) {
              partIndices[i] = model.getPartAt(locations[i]);
              orientations[i] = model.getPartOrientation(partIndices[i]);
            }
            const finalCount = count;
            const self = this;
            const interpolator = SplineInterpolator.newSplineInterpolator(0, 0, 1, 1);
            const start = new Date().getTime();
            const duration = this.attributes.twistDuration * Math.abs(angle);
            this.isTwisting = true;
            var f = function () {
              const now = new Date().getTime();
              const elapsed = now - start;
              const value = elapsed / duration;
              if (value < 1) {
                self.validateTwist(partIndices, locations, orientations, finalCount, axis, angle, interpolator.getFraction(value));
                self.repainter.repaint(f);
              } else {
                self.validateTwist(partIndices, locations, orientations, finalCount, axis, angle, 1.0);
                self.isTwisting = false;
              }
            };
            this.repainter.repaint(f);
          }
        }
        /**
     * Maps stickers to cube parts.
     * <p>
     * Sticker indices:
     * <pre>
     *             +---+---+---+
     *             |1,0|1,1|1,2|
     *             +--- --- ---+
     *             |1,3|1,4|1,5|
     *             +--- --- ---+
     *             |1,6|1,7|1,8|
     * +---+---+---+---+---+---+---+---+---+---+---+---+
     * |3,0|3,1|3,2|2,0|2,1|2,2|0,0|0,1|0,2|5,0|5,1|5,2|
     * +--- --- ---+--- --- ---+--- --- ---+--- --- ---+
     * |3,3|3,4|3,5|2,3|2,4|2,5|0,3|0,4|0,5|5,3|5,4|5,5|
     * +--- --- ---+--- --- ---+--- --- ---+--- --- ---+
     * |3,6|3,7|3,8|2,6|2,7|2,8|0,6|0,7|0,8|5,6|5,7|5,8|
     * +---+---+---+---+---+---+---+---+---+---+---+---+
     *             |4,0|4,1|4,2|
     *             +--- --- ---+
     *             |4,3|4,4|4,5|
     *             +--- --- ---+
     *             |4,6|4,7|4,8|
     *             +---+---+---+
     * </pre>
     * Sticker indices absolute values:
     * <pre>
     *             +---+---+---+
     *             | 9 |10 |11 |
     *             +--- --- ---+
     *             |12 |13 |14 |
     *             +--- --- ---+
     *             |15 |16 |17 |
     * +---+---+---+---+---+---+---+---+---+---+---+---+
     * |27 |28 |29 |18 |19 |20 | 0 | 1 | 2 |45 |46 |47 |
     * +--- --- ---+--- --- ---+--- --- ---+--- --- ---+
     * |30 |31 |32 |21 |22 |23 | 3 | 4 | 5 |48 |49 |50 |
     * +--- --- ---+--- --- ---+--- --- ---+--- --- ---+
     * |33 |34 |35 |24 |25 |26 | 6 | 7 | 8 |51 |52 |53 |
     * +---+---+---+---+---+---+---+---+---+---+---+---+
     *             |36 |37 |38 |
     *             +--- --- ---+
     *             |39 |40 |41 |
     *             +--- --- ---+
     *             |42 |43 |44 |
     *             +---+---+---+
     * </pre>
     * <p>
     * Part indices:
     * <pre>
     *                +----+----+----+
     *                | 4.0|11.1| 2.0|
     *                +----      ----+
     *                |14.0 21    8.0|
     *                +----      ----+
     *                | 6.0|17.1| 0.0|
     * +----+----+----+----+----+----+----+----+----+----+----+----+
     * | 4.1|14.1| 6.2| 6.1|17.0| 0.2| 0.1| 8.1| 2.2| 2.1|11.0| 4.2|
     * +----      ----+----      ----+----      ----+----      ----+
     * |15.0 23   18.0|18   22    9.1| 9.0 20   12.0|12   25   15.1|
     * +----      ----+----      ----+----      ----+----      ----+
     * | 5.2|16.1| 7.1| 7.2|19.0| 1.1| 1.2|10.1| 3.1| 3.2|13.0| 5.1|
     * +----+----+----+----+----+----+----+----+----+----+----+----+
     *                | 7.0|19.1| 1.0|
     *                +----      ----+
     *                |16.0 24   10.0|
     *                +----      ----+
     *                |5.0 |13.1| 3.0|
     *                +----+----+----+
     * </pre>
     */
        AbstractRubiksCubeCube3D.prototype.stickerToPartMap = [
          0, 8, 2, 9, 20, 12, 1, 10, 3,
          4, 11, 2, 14, 21, 8, 6, 17, 0,
          6, 17, 0, 18, 22, 9, 7, 19, 1,
          4, 14, 6, 15, 23, 18, 5, 16, 7,
          7, 19, 1, 16, 24, 10, 5, 13, 3,
          2, 11, 4, 12, 25, 15, 3, 13, 5
        ];
        AbstractRubiksCubeCube3D.prototype.partToStickerMap = null;
        AbstractRubiksCubeCube3D.prototype.stickerToFaceMap = [
          1, 1, 2, 0, 0, 0, 2, 1, 1,
          0, 1, 0, 0, 0, 0, 0, 1, 0,
          1, 0, 2, 1, 0, 1, 2, 0, 1,
          1, 1, 2, 0, 0, 0, 2, 1, 1,
          0, 1, 0, 0, 0, 0, 0, 1, 0,
          1, 0, 2, 1, 0, 1, 2, 0, 1
        ];
        AbstractRubiksCubeCube3D.prototype.boxClickToLocationMap = [
          [[7, 10 + 8, 6], [8 + 8, 3 + 8 + 12, 6 + 8], [5, 7 + 8, 4]],
          [[7, 8 + 8, 5], [11 + 8, 4 + 8 + 12, 5 + 8], [1, 2 + 8, 3]],
          [[7, 10 + 8, 6], [11 + 8, 2 + 8 + 12, 9 + 8], [1, 1 + 8, 0]],
          [[1, 1 + 8, 0], [2 + 8, 0 + 8 + 12, 0 + 8], [3, 4 + 8, 2]],
          [[6, 6 + 8, 4], [9 + 8, 1 + 8 + 12, 3 + 8], [0, 0 + 8, 2]],
          [[5, 7 + 8, 4], [5 + 8, 5 + 8 + 12, 3 + 8], [3, 4 + 8, 2]]
        ];
        AbstractRubiksCubeCube3D.prototype.boxClickToAxisMap = [
          [[0, 1, 0], [2, 0, 2], [0, 1, 0]],
          [[1, 2, 1], [0, 1, 0], [1, 2, 1]],
          [[2, 1, 2], [0, 2, 0], [2, 1, 2]],
          [[0, 1, 0], [2, 0, 2], [0, 1, 0]],
          [[1, 2, 1], [0, 1, 0], [1, 2, 1]],
          [[2, 1, 2], [0, 2, 0], [2, 1, 2]]
        ];
        AbstractRubiksCubeCube3D.prototype.boxClickToAngleMap = [
          [[-1, -1, -1], [-1, -1, 1], [-1, 1, -1]],
          [[-1, 1, -1], [1, -1, -1], [-1, -1, -1]],
          [[1, 1, 1], [-1, 1, 1], [1, -1, 1]],
          [[1, 1, 1], [1, 1, -1], [1, -1, 1]],
          [[1, -1, 1], [-1, 1, 1], [1, 1, 1]],
          [[-1, -1, -1], [1, -1, -1], [-1, 1, -1]]
        ];
        AbstractRubiksCubeCube3D.prototype.boxClickToLayerMap = [
          [[1, 2, 1], [2, 1, 2], [1, 2, 1]],
          [[1, 2, 1], [2, 1, 2], [1, 2, 1]],
          [[4, 2, 4], [2, 4, 2], [4, 2, 4]],
          [[4, 2, 4], [2, 4, 2], [4, 2, 4]],
          [[4, 2, 4], [2, 4, 2], [4, 2, 4]],
          [[1, 2, 1], [2, 1, 2], [1, 2, 1]]
        ];
        AbstractRubiksCubeCube3D.prototype.boxSwipeToAxisMap = [
          [1, 2, 1, 2],
          [2, 0, 2, 0],
          [1, 0, 1, 0],
          [1, 2, 1, 2],
          [2, 0, 2, 0],
          [1, 0, 1, 0]
        ];
        AbstractRubiksCubeCube3D.prototype.boxSwipeToAngleMap = [
          [-1, -1, 1, 1],
          [1, 1, -1, -1],
          [1, -1, -1, 1],
          [1, 1, -1, -1],
          [-1, -1, 1, 1],
          [-1, 1, 1, -1]
        ];
        AbstractRubiksCubeCube3D.prototype.boxSwipeToLayerMap = [
          [[[1, 4, 1, 4], [2, 4, 2, 4], [4, 4, 4, 4]], [[1, 2, 1, 2], [2, 2, 2, 2], [4, 2, 4, 2]], [[1, 1, 1, 1], [2, 1, 2, 1], [4, 1, 4, 1]]],
          [[[4, 1, 4, 1], [2, 1, 2, 1], [1, 1, 1, 1]], [[4, 2, 4, 2], [2, 2, 2, 2], [1, 2, 1, 2]], [[4, 4, 4, 4], [2, 4, 2, 4], [1, 4, 1, 4]]],
          [[[1, 1, 1, 1], [2, 1, 2, 1], [4, 1, 4, 1]], [[1, 2, 1, 2], [2, 2, 2, 2], [4, 2, 4, 2]], [[1, 4, 1, 4], [2, 4, 2, 4], [4, 4, 4, 4]]],
          [[[1, 4, 1, 4], [2, 4, 2, 4], [4, 4, 4, 4]], [[1, 2, 1, 2], [2, 2, 2, 2], [4, 2, 4, 2]], [[1, 1, 1, 1], [2, 1, 2, 1], [4, 1, 4, 1]]],
          [[[4, 1, 4, 1], [2, 1, 2, 1], [1, 1, 1, 1]], [[4, 2, 4, 2], [2, 2, 2, 2], [1, 2, 1, 2]], [[4, 4, 4, 4], [2, 4, 2, 4], [1, 4, 1, 4]]],
          [[[1, 1, 1, 1], [2, 1, 2, 1], [4, 1, 4, 1]], [[1, 2, 1, 2], [2, 2, 2, 2], [4, 2, 4, 2]], [[1, 4, 1, 4], [2, 4, 2, 4], [4, 4, 4, 4]]]
        ];
        AbstractRubiksCubeCube3D.prototype.stickerOffsets = [
          6, 3, 7, 3, 8, 3,
          6, 4, 7, 4, 8, 4,
          6, 5, 7, 5, 8, 5,
          3, 0, 4, 0, 5, 0,
          3, 1, 4, 1, 5, 1,
          3, 2, 4, 2, 5, 2,
          3, 3, 4, 3, 5, 3,
          3, 4, 4, 4, 5, 4,
          3, 5, 4, 5, 5, 5,
          0, 3, 1, 3, 2, 3,
          0, 4, 1, 4, 2, 4,
          0, 5, 1, 5, 2, 5,
          3, 6, 4, 6, 5, 6,
          3, 7, 4, 7, 5, 7,
          3, 8, 4, 8, 5, 8,
          6, 6, 7, 6, 8, 6,
          6, 7, 7, 7, 8, 7,
          6, 8, 7, 8, 8, 8
        ];
        return {
          AbstractRubiksCubeCube3D: AbstractRubiksCubeCube3D
        };
      });
    'use strict';
    define('Cube', [],
      function () {
        const module = {
          log: (false) ? console.log : () => {},
          info: (true) ? console.info : () => {},
          warning: (true) ? console.warning : () => {},
          error: (true) ? console.error : () => {}
        };
        /**
      *  <b>Corner parts</b>
    * <p>
    * This class defines the initial locations and orientations of the corner parts
    * as shown below:
    * <pre>
    *             +---+---+---+
    *          ulb|4.0|   |2.0|ubr
    *             +---     ---+
    *             |     u     |
    *             +---     ---+
    *          ufl|6.0|   |0.0|urf
    * +---+---+---+---+---+---+---+---+---+---+---+---+
    * |4.1|   |6.2|6.1|   |0.2|0.1|   |2.2|2.1|   |4.2|
    * +---     ---+---     ---+---     ---+---     ---+
    * |     l     |     f     |     r     |     b     |
    * +---     ---+---     ---+---     ---+---     ---+
    * |5.2|   |7.1|7.2|   |1.1|1.2|   |3.1|3.2|   |5.1|
    * +---+---+---+---+---+---+---+---+---+---+---+---+
    *          dlf|7.0|   |1.0|dfr
    *             +---     ---+
    *             |     d     |
    *             +---     ---+
    *          dbl|5.0|   |3.0|drb
    *             +---+---+---+
    * </pre>
    * <p>
    * The numbers before the dots represents the ID's of the corner parts. There are
    * 12 corner parts with ID's ranging from 0 through 11.  Since a corner part is
    * visible on three faces of the cube, the ID of each part is shown 3 times.
    * <p>
    * The numbers after the dots indicate the orientations of the corner parts.
    * Each corner part can have three different orientations: 0=initial,
    * 1=tilted counterclockwise and 2=titled clockwise.
    * <p>
    * The orientations of the corner parts are symmetric along the axis from the
    * right-up-front corner through the left-down-back corner of the cube.
    * <pre>
    *       +-----------+              +-----------+
    *      /4.0/   /2.0/|             /1.0/   /3.0/|
    *     +---     ---+.2            +---     ---+.2
    *    /     u     /|/|           /     d     /|/|
    *   +---     ---+   +          +---     ---+   +
    *  /6.0/   /0.0/|  /|         /7.0/   /5.0/|  /|
    * +---+---+---*.1  .1        +---+---+---*.1  .1
    * | .1|   | .2|/ r|/         | .1|   | .2|/ b|/
    * +---     ---+   +          +---     ---+   +
    * |     f     |/|/           |     l     |/|/
    * +---     ---+.2            +---     ---+.2
    * | .2|   | .1|/             |.2 |   | .1|/
    * +---+---+---+              +---+---+---+
    * </pre>
    * <p>
    * Here is an alternative representation of the initial locations and
    * orientations of the corner parts as a list:
    * <ul>
    * <li>0: urf</li><li>1: dfr</li><li>2: ubr</li><li>3: drb</li>
    * <li>4: ulb</li><li>5: dbl</li><li>6: ufl</li><li>7: dlf</li>
    * </ul>
    * <p>
    */
        /** <b>Edge parts</b>
     * <p>
     * This class defines the orientations of the edge parts and the location
     * of the first 12 edges.
     * (The locations of additional edge parts are defined by subclasses):
     * <pre>
     *               +----+---+----+
     *               |    |3.1|    |
     *               |    +---+    |
     *               +---+     +---+
     *             ul|6.0|  u  |0.0|ur
     *               +---+     +---+
     *               |    +---+    |
     *               |    |9.1|    |
     * +----+---+----+----+---+----+----+---+----+----+---+----+
     * |    |6.1|    |    |9.0|fu  |    |0.1|    |    |3.0|bu  |
     * |    +---+    |    +---+    |    +---+    |    +---+    |
     * +---+     +---+---+     +---+---+     +---+---+     +---+
     * |7.0|  l  10.0|10.1  f  |1.1|1.0|  r  |4.0|4.1|  b  |7.1|
     * +---+     +---+---+     +---+---+     +---+---+     +---+
     * |lb  +---+  lf|    +---+    |rf  +---+  rb|    +---+    |
     * |    |8.1|    |    11.0|fd  |    |2.1|    |    |5.0|bd  |
     * +----+---+----+----+---+----+----+---+----+----+---+----+
     *               |    11.1|    |
     *               |    +---+    |
     *               +---+     +---+
     *             dl|8.0|  d  |2.0|dr
     *               +---+     +---+
     *               |    +---+    |
     *               |    |5.1|    |
     *               +----+---+----+
     * </pre>
     * The numbers after the dots indicate the orientations of the edge parts.
     * Each edge part can have two different orientations: 0=initial, 1=flipped.
     * <pre>
     *               +----+---+----+
     *               |    |3.1|    |
     *               |    +---+    |
     *               +---+     +---+
     *             ul|6.0|  u  |0.0|ur
     *               +---+     +---+
     *               |    +---+    |
     *               |    |9.1|    |
     * +----+---+----+----+---+----+----+---+----+----+---+----+
     * |    |6.1|    |    |9.0|fu  |    |0.1|    |    |3.0|bu  |
     * |    +---+    |    +---+    |    +---+    |    +---+    |
     * +---+     +---+---+     +---+---+     +---+---+     +---+
     * |7.0|  l  10.0|10.1  f  |1.1|1.0|  r  |4.0|4.1|  b  |7.1|
     * +---+     +---+---+     +---+---+     +---+---+     +---+
     * |lb  +---+  lf|    +---+    |rf  +---+  rb|    +---+    |
     * |    |8.1|    |    11.0|fd  |    |2.1|    |    |5.0|bd  |
     * +----+---+----+----+---+----+----+---+----+----+---+----+
     *               |    11.1|    |
     *               |    +---+    |
     *               +---+     +---+
     *             dl|8.0|  d  |2.0|dr
     *               +---+     +---+
     *               |    +---+    |
     *               |    |5.1|    |
     *               +----+---+----+
     * </pre>
     * <p>
     * The orientations of the edge parts are symmetric along the axis from the
     * front-up edge through the back-down edge of the cube.
     * <pre>
     *       +-----------+      +-----------+
     *      /   / 3 /   /|      |\   \11 \   \
     *     +--- --- ---+ +      + +--- --- ---+
     *    /6.0/ u /0.0/|/|      |\|\8.0\ d \2.0\
     *   +--- --- ---+  4.0   10.0  +--- --- ---+
     *  /   / 9 /   /| |/|      |\ \|\   \ 5 \   \
     * +---+-*-+---+  r  +      +  l  +---+-*-+---+
     * |   |9.0|   |/| |/        \|\ \|   |5.0|   |
     * +--- --- ---+  2.1        6.1  +--- --- ---+
     * |10 | f | 1 |/|/            \|\| 7 | b | 4 |
     * +--- --- ---+ +              + +--- --- ---+
     * |   11.0|   |/                \|   |3.0|   |
     * +---+---+---+                  +---+---+---+
     * </pre>
     * <p>
     * Here is an alternative representation of the initial locations and
     * orientations of the edge parts as a list:
     * <ul>
     * <li> 0: ur</li><li> 1: rf</li><li> 2: dr</li>
     * <li> 3: bu</li><li> 4: rb</li><li> 5: bd</li>
     * <li> 6: ul</li><li> 7: lb</li><li> 8: dl</li>
     * <li> 9: fu</li><li>10: lf</li><li>11: fd</li>
     * </ul>
     * <p>
     */
        /** <b>Side parts</b>
     * <p>
     * This class defines the orientations of the side parts as shown below
     * (The locations of the side parts are defined by subclasses):
     * <pre>
     *             +-----------+
     *             |     .1    |
     *             |   +---+ u |
     *             | .0| 1 |.2 |
     *             |   +---+   |
     *             |     .3    |
     * +-----------+-----------+-----------+-----------+
     * |     .0    |     .2    |     .3    |    .1     |
     * |   +---+ l |   +---+ f |   +---+ r |   +---+ b |
     * | .3| 3 |.1 | .1| 2 |.3 | .2| 0 |.0 | .0| 5 |.2 |
     * |   +---+   |   +---+   |   +---+   |   +---+   |
     * |     .2    |    .0     |     .1    |     .3    |
     * +-----------+-----------+-----------+-----------+
     *             |     .0    |
     *             |   +---+ d |
     *             | .3| 4 |.1 |
     *             |   +---+   |
     *             |     .2    |
     *             +-----------+
     * </pre>
     * The numbers after the dots indicate the orientations of the side parts.
     * Each side part can have four different orientations: 0=initial,
     * 1=tilted clockwise, 2=flipped, 3=tilted counterclockwise.
     * <p>
     * The orientations of the side parts are symmetric along the axis from the
     * right-up-front corner through the left-down-back corner of the cube.
     * <pre>
     *       +-----------+              +-----------+
     *      /     .1    /|             /     .1    /|
     *     +    ---    +r+            +    ---    +b+
     *    / .0/ 1 /.2 /  |           / .0/ 4 /.2 /  |
     *   +    ---    +.3 +          +    ---    +.3 +
     *  / u   .3    / /|.0         / d   .3    / /|.0
     * +---+---+---*  0  +        +---+---+---*  5  +
     * | f   .2    .2|/ /         | l   .2    .2|/ /
     * +    ---    + .1+          +    ---    + .1+
     * | .1| 2 |.3 |  /           | .1| 3 |.3 |  /
     * +    ---    + +            +    ---    + +
     * |     .0    |/             |     .0    |/
     * +---+---+---+              +---+---+---+
     * </pre>
     * <p>
     * Here is an alternative representation of the initial locations and
     * orientations of the side parts as a list:
     * <ul>
     * <li>0: r</li> <li>1: u</li> <li>2: f</li>
     * <li>3: l</li> <li>4: d</li> <li>5: b</li>
     * </ul>
     */
        class CubeEvent {
          constructor(source, axis, layerMask, angle) {
            this.source = source;
            this.axis = axis;
            this.angle = angle;
            this.layerMask = layerMask;
          }

          getAffectedLocations() {
            const c1 = this.source.clone();
            c1.reset();
            c1.transform(this.axis, this.layerMask, this.angle);
            return c1.getUnsolvedParts();
          }
        }
        class Cube {
          constructor(layerCount) {
            if (layerCount < 2) {
              throw new IllegalArgumentException('this.layerCount: ' + this.layerCount + ' < 2');
            }
            this.layerCount = layerCount;
            this.cornerLoc = new Array(8);
            this.cornerOrient = new Array(8);
            this.listenerList = [];
            if (this.layerCount > 2) {
              this.edgeLoc = new Array((this.layerCount - 2) * 12);
              this.edgeOrient = new Array(this.edgeLoc.length);
              this.sideLoc = new Array((this.layerCount - 2) * (this.layerCount - 2) * 6);
              this.sideOrient = new Array(this.sideLoc.length);
            } else {
              this.edgeLoc = this.edgeOrient = this.sideLoc = this.sideOrient = new Array(0);
            }
            this.owner = null;
            this.cancel = false;
          }

          lock(owner) {
            if (this.owner == null || this.owner === owner) {
              this.owner = owner;
              return true;
            }
            return false;
          }

          unlock(owner) {
            if (this.owner === owner) {
              this.owner = null;
              return true;
            }
            return false;
          }

          equals(that) {
            return that.getLayerCount() == this.layerCount && Arrays.equals(that.getCornerLocations(), this.cornerLoc) && Arrays.equals(that.getCornerOrientations(), this.cornerOrient) && Arrays.equals(that.getEdgeLocations(), this.edgeLoc) && Arrays.equals(that.getEdgeOrientations(), this.edgeOrient) && Arrays.equals(that.getSideLocations(), this.sideLoc) && Arrays.equals(that.getSideOrientations(), this.sideOrient);
          }

          hashCode() {
            let hash = 0;
            let sub = 0;
            for (var i = 0; i < this.cornerLoc.length; i++) {
              sub = sub << 1 + this.cornerLoc[i];
            }
            hash |= sub;
            sub = 0;
            for (var i = 0; i < this.edgeLoc.length; i++) {
              sub = sub << 1 + this.edgeLoc[i];
            }
            hash |= sub;
            sub = 0;
            for (var i = 0; i < this.sideLoc.length; i++) {
              sub = sub << 1 + this.sideLoc[i];
            }
            return hash;
          }

          reset() {
            this.transformType = this.IDENTITY_TRANSFORM;
            let i;
            for (i = 0; i < this.cornerLoc.length; i++) {
              this.cornerLoc[i] = i;
              this.cornerOrient[i] = 0;
            }
            for (i = 0; i < this.edgeLoc.length; i++) {
              this.edgeLoc[i] = i;
              this.edgeOrient[i] = 0;
            }
            for (i = 0; i < this.sideLoc.length; i++) {
              this.sideLoc[i] = i;
              this.sideOrient[i] = 0;
            }
            this.fireCubeChanged(new CubeEvent(this, 0, 0, 0));
          }

          isSolved() {
            let i;
            for (i = 0; i < this.cornerLoc.length; i++) {
              if (this.cornerLoc[i] != i) {
                return false;
              }
              if (this.cornerOrient[i] != 0) {
                return false;
              }
            }
            for (i = 0; i < this.edgeLoc.length; i++) {
              if (this.edgeLoc[i] != i) {
                return false;
              }
              if (this.edgeOrient[i] != 0) {
                return false;
              }
            }
            for (i = 0; i < this.sideLoc.length; i++) {
              if (this.sideLoc[i] != i) {
                return false;
              }
              if (this.sideOrient[i] != 0) {
                return false;
              }
            }
            return true;
          }

          addCubeListener(l) {
            this.listenerList[this.listenerList.length] = l;
          }

          removeCubeListener(l) {
            for (let i = 0; i < this.listenerList.length; i++) {
              if (this.listenerList[i] == l) {
                this.listenerList = this.listenerList.slice(0, i) + this.listenerList.slice(i + 1);
                break;
              }
            }
          }

          fireCubeTwisted(event) {
            if (!this.quiet) {
              const listeners = this.listenerList;
              for (let i = listeners.length - 1; i >= 0; i -= 1) {
                listeners[i].cubeTwisted(event);
              }
            }
          }

          fireCubeChanged(event) {
            if (!this.quiet) {
              const listeners = this.listenerList;
              for (let i = listeners.length - 1; i >= 0; i -= 1) {
                listeners[i].cubeChanged(event);
              }
            }
          }

          setQuiet(b) {
            if (b != this.quiet) {
              this.quiet = b;
              if (!this.quiet) {
                this.fireCubeChanged(new CubeEvent(this, 0, 0, 0));
              }
            }
          }

          isQuiet() {
            return this.quiet;
          }

          getCornerLocations() {
            return this.cornerLoc;
          }

          getCornerOrientations() {
            return this.cornerOrient;
          }

          setCorners(locations, orientations) {
            {
              this.transformType = this.UNKNOWN_TRANSFORM;
              this.cornerLoc = locations.slice(0, this.cornerLoc.length);
              this.cornerOrient = orientations.slice(0, this.cornerOrient.length);
            }
            this.fireCubeChanged(new CubeEvent(this, 0, 0, 0));
          }

          getCornerAt(location) {
            return this.cornerLoc[location];
          }

          getCornerLocation(corner) {
            let i;
            if (this.cornerLoc[corner] == corner) {
              return corner;
            }
            for (i = this.cornerLoc.length - 1; i >= 0; i--) {
              if (this.cornerLoc[i] == corner) {
                break;
              }
            }
            return i;
          }

          getCornerCount() {
            return this.cornerLoc.length;
          }

          getEdgeCount() {
            return this.edgeLoc.length;
          }

          getSideCount() {
            return this.sideLoc.length;
          }

          getCornerOrientation(corner) {
            return this.cornerOrient[this.getCornerLocation(corner)];
          }

          getEdgeLocations() {
            return this.edgeLoc;
          }

          getEdgeOrientations() {
            return this.edgeOrient;
          }

          setEdges(locations, orientations) {
            {
              this.transformType = this.UNKNOWN_TRANSFORM;
              this.edgeLoc = locations.slice(0, this.edgeLoc.length);
              this.edgeOrientations = this.edgeOrient.slice(0, this.edgeOrient.length);
            }
            this.fireCubeChanged(new CubeEvent(this, 0, 0, 0));
          }

          getEdgeAt(location) {
            return this.edgeLoc[location];
          }

          getEdgeLocation(edge) {
            let i;
            if (this.edgeLoc[edge] == edge) {
              return edge;
            }
            for (i = this.edgeLoc.length - 1; i >= 0; i--) {
              if (this.edgeLoc[i] == edge) {
                break;
              }
            }
            return i;
          }

          getEdgeOrientation(edge) {
            return this.edgeOrient[this.getEdgeLocation(edge)];
          }

          getSideLocations() {
            return this.sideLoc;
          }

          getSideOrientations() {
            return this.sideOrient;
          }

          setSides(locations, orientations) {
            {
              this.transformType = this.UNKNOWN_TRANSFORM;
              this.sideLoc = locations.slice(0, this.sideLoc.length);
              this.sideOrient = orientations.slice(0, this.sideOrient.length);
            }
            this.fireCubeChanged(new CubeEvent(this, 0, 0, 0));
          }

          getSideAt(location) {
            return this.sideLoc[location];
          }

          getSideFace(sidePart) {
            return this.getSideLocation(sidePart) % 6;
          }

          getSideLocation(side) {
            let i;
            if (this.sideLoc[side] == side) {
              return side;
            }
            for (i = this.sideLoc.length - 1; i >= 0; i--) {
              if (this.sideLoc[i] == side) {
                break;
              }
            }
            return i;
          }

          getSideOrientation(side) {
            return this.sideOrient[this.getSideLocation(side)];
          }

          setTo(that) {
            if (that.getLayerCount() != this.getLayerCount()) {
              throw ('that.layers=' + that.getLayerCount() + ' must match this.layers=' + this.getLayerCount());
            }
            this.transformType = that.transformType;
            this.transformAxis = that.transformAxis;
            this.transformAngle = that.transformAngle;
            this.transformMask = that.transformMask;
            this.sideLoc = that.getSideLocations().slice(0, this.sideLoc.length);
            this.sideOrient = that.getSideOrientations().slice(0, this.sideOrient.length);
            this.edgeLoc = that.getEdgeLocations().slice(0, this.edgeLoc.length);
            this.edgeOrient = that.getEdgeOrientations().slice(0, this.edgeOrient.length);
            this.cornerLoc = that.getCornerLocations().slice(0, this.cornerLoc.length);
            this.cornerOrient = that.getCornerOrientations().slice(0, this.cornerOrient.length);
            this.fireCubeChanged(new CubeEvent(this, 0, 0, 0));
          }

          getLayerCount() {
            return this.layerCount;
          }

          transform(axis, layerMask, angle) {
            {
              switch (this.transformType) {
                case this.IDENTITY_TRANSFORM:
                  this.transformAxis = axis;
                  this.transformMask = layerMask;
                  this.transformAngle = angle;
                  this.transformType = this.SINGLE_AXIS_TRANSFORM;
                  break;
                case this.SINGLE_AXIS_TRANSFORM:
                  if (this.transformAxis == axis) {
                    if (this.transformAngle == angle) {
                      if (this.transformMask == layerMask) {
                        this.transformAngle = (this.transformAngle + angle) % 3;
                      } else if ((this.transformMask & layerMask) == 0) {
                        this.transformMask |= layerMask;
                      } else {
                        this.transformType = this.GENERAL_TRANSFORM;
                      }
                    } else {
                      if (this.transformMask == layerMask) {
                        this.transformAngle = (this.transformAngle + angle) % 3;
                      } else {
                        this.transformType = this.GENERAL_TRANSFORM;
                      }
                    }
                  } else {
                    this.transformType = this.GENERAL_TRANSFORM;
                  }
                  break;
              }
              this.transform0(axis, layerMask, angle);
            }
            if (!this.isQuiet()) {
              this.fireCubeTwisted(new CubeEvent(this, axis, layerMask, angle));
            }
          }

          transformFromCube(tx) {
            if (tx.getLayerCount() != this.getLayerCount()) {
              throw ('tx.layers=' + tx.getLayerCount() + ' must match this.layers=' + this.getLayerCount());
            }
            let taxis = 0; let tangle = 0; let tmask = 0;
            {
              {
                {
                  const atx = tx;
                  switch (atx.transformType) {
                    case this.IDENTITY_TRANSFORM:
                      return;
                    case SINGLE_AXIS_TRANSFORM:
                      taxis = atx.transformAxis;
                      tangle = atx.transformAngle;
                      tmask = atx.transformMask;
                      break;
                  }
                }
                if (tmask == 0) {
                  this.transformType = this.UNKNOWN_TRANSFORM;
                  let tempLoc;
                  let tempOrient;
                  tempLoc = this.cornerLoc.slice(0);
                  tempOrient = this.cornerOrient.slice(0);
                  let txLoc = tx.getCornerLocations();
                  let txOrient = tx.getCornerOrientations();
                  for (var i = 0; i < txLoc.length; i++) {
                    this.cornerLoc[i] = tempLoc[txLoc[i]];
                    this.cornerOrient[i] = (tempOrient[txLoc[i]] + txOrient[i]) % 3;
                  }
                  tempLoc = this.edgeLoc.slice(0);
                  tempOrient = this.edgeOrient.slice(0);
                  txLoc = tx.getEdgeLocations();
                  txOrient = tx.getEdgeOrientations();
                  for (var i = 0; i < txLoc.length; i++) {
                    this.edgeLoc[i] = tempLoc[txLoc[i]];
                    this.edgeOrient[i] = (tempOrient[txLoc[i]] + txOrient[i]) % 2;
                  }
                  tempLoc = this.sideLoc.slice(0);
                  tempOrient = this.sideOrient.slice(0);
                  txLoc = tx.getSideLocations();
                  txOrient = tx.getSideOrientations();
                  for (var i = 0; i < txLoc.length; i++) {
                    this.sideLoc[i] = tempLoc[txLoc[i]];
                    this.sideOrient[i] = (tempOrient[txLoc[i]] + txOrient[i]) % 4;
                  }
                }
              }
            }
            if (tmask == 0) {
              this.fireCubeChanged(new CubeEvent(this, 0, 0, 0));
            } else {
              this.transform(taxis, tmask, tangle);
            }
          }

          twoCycle(
            loc, l1, l2,
            orient, o1, o2,
            modulo) {
            let swap;
            swap = loc[l1];
            loc[l1] = loc[l2];
            loc[l2] = swap;
            swap = orient[l1];
            orient[l1] = (orient[l2] + o1) % modulo;
            orient[l2] = (swap + o2) % modulo;
          }

          fourCycle(
            loc, l1, l2, l3, l4,
            orient, o1, o2, o3, o4,
            modulo) {
            let swap;
            swap = loc[l1];
            loc[l1] = loc[l2];
            loc[l2] = loc[l3];
            loc[l3] = loc[l4];
            loc[l4] = swap;
            swap = orient[l1];
            orient[l1] = (orient[l2] + o1) % modulo;
            orient[l2] = (orient[l3] + o2) % modulo;
            orient[l3] = (orient[l4] + o3) % modulo;
            orient[l4] = (swap + o4) % modulo;
          }

          getPartFace(part, orient) {
            {
              if (part < this.cornerLoc.length) {
                return getCornerFace(part, orient);
              } else if (part < this.cornerLoc.length + this.edgeLoc.length) {
                return getEdgeFace(part - this.cornerLoc.length, orient);
              } else if (part < this.cornerLoc.length + this.edgeLoc.length + this.sideLoc.length) {
                return getSideFace(part - this.cornerLoc.length - this.edgeLoc.length);
              } else {
                return getCenterSide(orient);
              }
            }
          }

          getPartOrientation(part) {
            if (part < this.cornerLoc.length) {
              return this.getCornerOrientation(part);
            } else if (part < this.cornerLoc.length + this.edgeLoc.length) {
              return this.getEdgeOrientation(part - this.cornerLoc.length);
            } else if (part < this.cornerLoc.length + this.edgeLoc.length + this.sideLoc.length) {
              return this.getSideOrientation(part - this.cornerLoc.length - this.edgeLoc.length);
            } else {
              return this.getCubeOrientation();
            }
          }

          getPartLocation(part) {
            if (part < this.cornerLoc.length) {
              return this.getCornerLocation(part);
            } else if (part < this.cornerLoc.length + this.edgeLoc.length) {
              return this.cornerLoc.length + this.getEdgeLocation(part - this.cornerLoc.length);
            } else if (part < this.cornerLoc.length + this.edgeLoc.length + this.sideLoc.length) {
              return this.cornerLoc.length + this.edgeLoc.length + this.getSideLocation(part - this.cornerLoc.length - this.edgeLoc.length);
            } else {
              return 0;
            }
          }

          getPartAxis(part, orientation) {
            if (part < this.cornerLoc.length) {
              var face = getPartFace(part, orientation);
              return (face) % 3;
            } else if (part < this.cornerLoc.length + this.edgeLoc.length) {
              return EDGE_TO_AXIS_MAP[getEdgeLocation(part - this.cornerLoc.length) % 12];
            } else if (part < this.cornerLoc.length + this.edgeLoc.length + this.sideLoc.length) {
              var face = getPartFace(part, orientation);
              return (face) % 3;
            } else {
              return -1;
            }
          }

          getPartAngle(part, orientation) {
            if (part >= this.cornerLoc.length && part < this.cornerLoc.length + this.edgeLoc.length) {
              return EDGE_TO_ANGLE_MAP[getEdgeLocation(part - this.cornerLoc.length) % 12][(getEdgeOrientation(part - this.cornerLoc.length) + orientation) % 2];
            } else {
              const side = getPartFace(part, orientation);
              switch (side) {
                case 0:
                case 1:
                case 2:
                  return 1;
                case 3:
                case 4:
                case 5:
                default:
                  return -1;
              }
            }
          }

          getPartType(part) {
            if (part < this.cornerLoc.length) {
              return this.CORNER_PART;
            } else if (part < this.cornerLoc.length + this.edgeLoc.length) {
              return this.EDGE_PART;
            } else if (part < this.cornerLoc.length + this.edgeLoc.length + this.sideLoc.length) {
              return this.SIDE_PART;
            } else {
              return this.CENTER_PART;
            }
          }

          getPartAt(location) {
            let result = null;
            if (location < this.cornerLoc.length) {
              result = this.getCornerAt(location);
            } else if (location < this.cornerLoc.length + this.edgeLoc.length) {
              result = this.cornerLoc.length + this.getEdgeAt(location - this.cornerLoc.length);
            } else if (location < this.cornerLoc.length + this.edgeLoc.length + this.sideLoc.length) {
              result = this.cornerLoc.length + this.edgeLoc.length + this.getSideAt(location - this.cornerLoc.length - this.edgeLoc.length);
            } else {
              result = this.cornerLoc.length + this.edgeLoc.length + this.sideLoc.length;
            }
            module.log('getPartAt(' + location + '):' + result);
            return result;
          }

          getTypedIndexForPartIndex(part) {
            if (part < this.cornerLoc.length) {
              return part;
            } else if (part < this.cornerLoc.length + this.edgeLoc.length) {
              return part - this.cornerLoc.length;
            } else if (part < this.cornerLoc.length + this.edgeLoc.length + this.sideLoc.length) {
              return part - this.cornerLoc.length - this.edgeLoc.length;
            } else {
              return part - this.cornerLoc.length - this.edgeLoc.length - this.sideLoc.length;
            }
          }

          getCenterSide(orient) {
            return this.CENTER_TO_SIDE_MAP[getCubeOrientation()][orient];
          }

          getEdgeFace(edge, orient) {
            const loc = getEdgeLocation(edge) % 12;
            const ori = (this.edgeOrient[loc] + orient) % 2;
            return this.EDGE_TO_FACE_MAP[loc][ori];
          }

          getCornerFace(corner, orient) {
            const loc = getCornerLocation(corner);
            const ori = (3 + orient - this.cornerOrient[loc]) % 3;
            return this.CORNER_TO_FACE_MAP[loc][ori];
          }

          getCubeOrientation() {
            if (this.sideLoc.length == 0) {
              return -1;
            }
            switch (this.sideLoc[2] * 6 + this.sideLoc[0]) {
              case 2 * 6 + 0:
                return 0;
              case 4 * 6 + 0:
                return 1;
              case 5 * 6 + 0:
                return 2;
              case 1 * 6 + 0:
                return 3; // Top, Right, CR'
              case 0 * 6 + 5:
                return 4;
              case 5 * 6 + 3:
                return 5;
              case 3 * 6 + 2:
                return 6; // Left, Front, CU'
              case 2 * 6 + 1:
                return 7;
              case 2 * 6 + 3:
                return 8;
              case 2 * 6 + 4:
                return 9; // Front, Bottom, CF'
              case 0 * 6 + 1:
                return 10;
              case 1 * 6 + 3:
                return 11;
              case 3 * 6 + 4:
                return 12; // Left, Down, CR CU'
              case 0 * 6 + 2:
                return 13;
              case 3 * 6 + 5:
                return 14; // Left, Back, CR2 CU'
              case 0 * 6 + 4:
                return 15; // Right, Down, CR' CU
              case 4 * 6 + 3:
                return 16; // Down, Left, CR' CU2
              case 3 * 6 + 1:
                return 17; // Left, Up, CR' CU'
              case 4 * 6 + 1:
                return 18;
              case 4 * 6 + 5:
                return 19; // Down, Back, CR CF'
              case 5 * 6 + 4:
                return 20;
              case 5 * 6 + 1:
                return 21; // Back, Up, CR2 CF'
              case 1 * 6 + 5:
                return 22; // Up, Back, CR' CF
              case 1 * 6 + 2:
                return 23; // Up, Front, CR' CF'
              default:
                return -1;
            }
          }

          getPartCount() {
            return getCornerCount() + getEdgeCount() + getSideCount() + 1;
          }

          getUnsolvedParts() {
            const a = new Array(this.cornerLoc.length + this.edgeLoc.length + this.sideLoc.length);
            let count = 0;
            for (var i = 0; i < this.cornerLoc.length; i++) {
              if (this.cornerLoc[i] != i || this.cornerOrient[i] != 0) {
                a[count++] = i;
              }
            }
            for (var i = 0; i < this.edgeLoc.length; i++) {
              if (this.edgeLoc[i] != i || this.edgeOrient[i] != 0) {
                a[count++] = i + this.cornerLoc.length;
              }
            }
            for (var i = 0; i < this.sideLoc.length; i++) {
              if (this.sideLoc[i] != i || this.sideOrient[i] != 0) {
                a[count++] = i + this.cornerLoc.length + this.edgeLoc.length;
              }
            }
            let result = new Array(count);
            result = a.slice(0, count);
            return result;
          }

          scramble(scrambleCount) {
            if (scrambleCount == null) { scrambleCount = 21; }
            this.setQuiet(true);
            let prevAxis = -1;
            let axis, layerMask, angle;
            for (let i = 0; i < scrambleCount; i++) {
              while ((axis = Math.floor(Math.random() * 3)) == prevAxis) {
              }
              prevAxis = axis;
              layerMask = 1 << Math.floor(Math.random() * this.layerCount);
              while ((angle = Math.floor(Math.random() * 5) - 2) == 0) {
              }
              this.transform(axis, layerMask, angle);
            }
            this.setQuiet(false);
          }

          toPermutationString() {
            return this.toPermutationString0('PRECIRCUMFIX',
              'r', 'u', 'f', 'l', 'd', 'b',
              '+', '++', '-',
              '(', ')', ',');
          }

          toPermutationString0(
            syntax,
            tR, tU, tF,
            tL, tD, tB,
            tPlus, tPlusPlus, tMinus,
            tBegin, tEnd, tDelimiter) {
            const cube = this;
            let buf = '';
            const corners = this.toCornerPermutationString(syntax,
              tR, tU, tF, tL, tD, tB,
              tPlus, tPlusPlus, tMinus,
              tBegin, tEnd, tDelimiter);
            const edges = this.toEdgePermutationString(syntax,
              tR, tU, tF, tL, tD, tB,
              tPlus, tPlusPlus, tMinus,
              tBegin, tEnd, tDelimiter);
            const sides = this.toSidePermutationString(syntax,
              tR, tU, tF, tL, tD, tB,
              tPlus, tPlusPlus, tMinus,
              tBegin, tEnd, tDelimiter);
            buf = buf + corners;
            if (buf.length > 0 && edges.length > 0) {
              buf += '\n';
            }
            buf = buf + edges;
            if (buf.length > 0 && sides.length > 0) {
              buf += '\n';
            }
            buf = buf + sides;
            if (buf.length == 0) {
              buf = buf + tBegin;
              buf = buf + tEnd;
            }
            return buf;
          }

          toCornerPermutationString(syntax,
            tR, tU, tF,
            tL, tD, tB,
            tPlus, tPlusPlus, tMinus,
            tBegin, tEnd, tDelimiter) {
            const cube = this;
            const cornerLoc = cube.cornerLoc;
            const edgeLoc = cube.edgeLoc;
            const sideLoc = cube.sideLoc;
            const cornerOrient = cube.cornerOrient;
            const edgeOrient = cube.edgeOrient;
            const sideOrient = cube.sideOrient;
            const cycle = Array(Math.max(Math.max(cube.getCornerCount(), cube.getEdgeCount()), cube.getSideCount()));
            const layerCount = cube.getLayerCount();
            const hasEvenLayerCount = layerCount % 2 == 0;
            let buf = '';
            let visitedLocs = Array();
            let i, j, k, l, p, n;
            let prevOrient;
            let isFirst;
            const corners = [
              [tU, tR, tF],
              [tD, tF, tR],
              [tU, tB, tR],
              [tD, tR, tB],
              [tU, tL, tB],
              [tD, tB, tL],
              [tU, tF, tL],
              [tD, tL, tF]
            ];
            visitedLocs = new Array(cube.getCornerCount());
            isFirst = true;
            for (i = 0, n = cube.getCornerCount(); i < n; i++) {
              if (!visitedLocs[i]) {
                if (cornerLoc[i] == i && cornerOrient[i] == 0) {
                  continue;
                }
                let cycleLength = 0;
                let cycleStart = 0;
                j = i;
                while (!visitedLocs[j]) {
                  visitedLocs[j] = true;
                  cycle[cycleLength++] = j;
                  if (cornerLoc[j] < cornerLoc[cycle[cycleStart]]) {
                    cycleStart = cycleLength - 1;
                  }
                  for (k = 0; cornerLoc[k] != j; k++) {
                  }
                  j = k;
                }
                if (isFirst) {
                  isFirst = false;
                } else {
                  buf += ' ';
                }
                if (syntax == 'PREFIX') {
                  p = buf.length;
                  buf = buf + tBegin;
                } else if (syntax == 'PRECIRCUMFIX') {
                  buf = buf + tBegin;
                  p = buf.length;
                } else {
                  buf = buf + tBegin;
                  p = -1;
                }
                prevOrient = 0;
                for (k = 0; k < cycleLength; k++) {
                  j = cycle[(cycleStart + k) % cycleLength];
                  if (k != 0) {
                    buf = buf + tDelimiter;
                    prevOrient = (prevOrient + cornerOrient[j]) % 3;
                  }
                  switch (prevOrient) {
                    case 0:
                      buf += corners[j][0];
                      buf += corners[j][1];
                      buf += corners[j][2];
                      break;
                    case 2:
                      buf += corners[j][1];
                      buf += corners[j][2];
                      buf += corners[j][0];
                      break;
                    case 1:
                      buf += corners[j][2];
                      buf += corners[j][0];
                      buf += corners[j][1];
                      break;
                  }
                }
                j = cycle[cycleStart];
                prevOrient = (prevOrient + cornerOrient[j]) % 3;
                if (syntax == 'POSTCIRCUMFIX') {
                  p = buf.length;
                  buf += tEnd;
                } else if (syntax == 'SUFFIX') {
                  buf += tEnd;
                  p = buf.length;
                } else {
                  buf += tEnd;
                }
                if (prevOrient != 0) {
                  buf = buf.substring(0, p) + ((prevOrient == 1) ? tMinus : tPlus) + buf.substring(p);
                }
              }
            }
            return buf;
          }

          toEdgePermutationString(syntax,
            tR, tU, tF,
            tL, tD, tB,
            tPlus, tPlusPlus, tMinus,
            tBegin, tEnd, tDelimiter) {
            const cube = this;
            const cornerLoc = cube.getCornerLocations();
            const edgeLoc = cube.getEdgeLocations();
            const sideLoc = cube.getSideLocations();
            const cornerOrient = cube.getCornerOrientations();
            const edgeOrient = cube.getEdgeOrientations();
            const sideOrient = cube.getSideOrientations();
            const cycle = Array(Math.max(Math.max(cube.getCornerCount(), cube.getEdgeCount()), cube.getSideCount()));
            const layerCount = cube.getLayerCount();
            const hasEvenLayerCount = layerCount % 2 == 0;
            let buf = '';
            let visitedLocs = Array();
            let i, j, k, l, p, n;
            let prevOrient;
            let isFirst;
            if (edgeLoc.length > 0) {
              const edges = [
                [tU, tR], // "ur"
                [tR, tF], // "rf"
                [tD, tR], // "dr"
                [tB, tU], // "bu"
                [tR, tB], // "rb"
                [tB, tD], // "bd"
                [tU, tL], // "ul"
                [tL, tB], // "lb"
                [tD, tL], // "dl"
                [tF, tU], // "fu"
                [tL, tF], // "lf"
                [tF, tD] // "fd"
              ];
              visitedLocs = new Array(cube.getEdgeCount());
              isFirst = true;
              let previousCycleStartEdge = -1;
              for (i = 0, n = cube.getEdgeCount(); i < n; i++) {
                if (!visitedLocs[i]) {
                  if (edgeLoc[i] == i && edgeOrient[i] == 0) {
                    continue;
                  }
                  let cycleLength = 0;
                  let cycleStart = 0;
                  j = i;
                  while (!visitedLocs[j]) {
                    visitedLocs[j] = true;
                    cycle[cycleLength++] = j;
                    if (previousCycleStartEdge == j % 12) {
                      cycleStart = cycleLength - 1;
                    }
                    for (k = 0; edgeLoc[k] != j; k++) {
                    }
                    j = k;
                  }
                  previousCycleStartEdge = cycle[cycleStart] % 12;
                  if (isFirst) {
                    isFirst = false;
                  } else {
                    buf += ' ';
                  }
                  if (syntax == 'PREFIX') {
                    p = buf.length;
                    buf += (tBegin);
                  } else if (syntax == 'PRECIRCUMFIX') {
                    buf += (tBegin);
                    p = buf.length;
                  } else {
                    buf += (tBegin);
                    p = -1;
                  }
                  prevOrient = 0;
                  for (k = 0; k < cycleLength; k++) {
                    j = cycle[(cycleStart + k) % cycleLength];
                    if (k != 0) {
                      buf += (tDelimiter);
                      prevOrient ^= edgeOrient[j];
                    }
                    if (prevOrient == 1) {
                      buf += (edges[j % 12][1]);
                      buf += (edges[j % 12][0]);
                    } else {
                      buf += (edges[j % 12][0]);
                      buf += (edges[j % 12][1]);
                    }
                    if (hasEvenLayerCount) {
                      buf += (j / 12 + 1);
                    } else {
                      if (j >= 12) {
                        buf += (j / 12);
                      }
                    }
                  }
                  j = cycle[cycleStart];
                  if (syntax == 'POSTCIRCUMFIX') {
                    p = buf.length;
                    buf += (tEnd);
                  } else if (syntax == 'SUFFIX') {
                    buf += (tEnd);
                    p = buf.length;
                  } else {
                    buf += (tEnd);
                  }
                  if ((prevOrient ^ edgeOrient[j]) == 1) {
                    buf = buf.substring(0, p) + tPlus + buf.substring(p);
                  }
                }
              }
            }
            return buf;
          }

          toSidePermutationString(syntax,
            tR, tU, tF,
            tL, tD, tB,
            tPlus, tPlusPlus, tMinus,
            tBegin, tEnd, tDelimiter) {
            const cube = this;
            const cornerLoc = cube.getCornerLocations();
            const edgeLoc = cube.getEdgeLocations();
            const sideLoc = cube.getSideLocations();
            const cornerOrient = cube.getCornerOrientations();
            const edgeOrient = cube.getEdgeOrientations();
            const sideOrient = cube.getSideOrientations();
            const cycle = new Array(Math.max(Math.max(cube.getCornerCount(), cube.getEdgeCount()), cube.getSideCount()));
            const layerCount = cube.getLayerCount();
            const hasEvenLayerCount = layerCount % 2 == 0;
            let buf = '';
            let visitedLocs;
            let i, j, k, l, p, n;
            let prevOrient;
            let isFirst;
            if (sideLoc.length > 0) {
              const sides = [
                tR, tU, tF, tL, tD, tB
              ];
              const sideOrients = [
                '', tMinus, tPlusPlus, tPlus
              ];
              visitedLocs = new Array(cube.getSideCount());
              isFirst = true;
              let previousCycleStartSide;
              for (let twoPass = 0; twoPass < 2; twoPass++) {
                for (i = 0; i < visitedLocs.length; i++) { visitedLocs[i] = false; }
                for (let byFaces = 0, nf = 6; byFaces < nf; byFaces++) {
                  previousCycleStartSide = -1;
                  for (let byParts = 0, np = cube.getSideCount() / 6; byParts < np; byParts++) {
                    i = byParts + byFaces * np;
                    if (!visitedLocs[i]) {
                      if (sideLoc[i] == i && sideOrient[i] == 0) {
                        continue;
                      }
                      let cycleLength = 0;
                      let cycleStart = 0;
                      let isOnSingleFace = true;
                      j = i;
                      while (!visitedLocs[j]) {
                        visitedLocs[j] = true;
                        cycle[cycleLength++] = j;
                        if (j % 6 != i % 6) {
                          isOnSingleFace = false;
                        }
                        if (cycle[cycleStart] > j) {
                          cycleStart = cycleLength - 1;
                        }
                        for (k = 0; sideLoc[k] != j; k++) {
                        }
                        j = k;
                      }
                      previousCycleStartSide = cycle[cycleStart] % 6;
                      if (isOnSingleFace == (twoPass == 0)) {
                        if (isFirst) {
                          isFirst = false;
                        } else {
                          buf += (' ');
                        }
                        if (syntax == 'PREFIX') {
                          p = buf.length;
                          buf += (tBegin);
                        } else if (syntax == 'PRECIRCUMFIX') {
                          buf += (tBegin);
                          p = buf.length;
                        } else {
                          buf += (tBegin);
                          p = -1;
                        }
                        prevOrient = 0;
                        for (k = 0; k < cycleLength; k++) {
                          j = cycle[(cycleStart + k) % cycleLength];
                          if (k != 0) {
                            buf += (tDelimiter);
                            prevOrient = (prevOrient + sideOrient[j]) % 4;
                          }
                          if (syntax == 'PREFIX' ||
                      syntax == 'PRECIRCUMFIX' ||
                      syntax == 'POSTCIRCUMFIX') {
                            buf += (sideOrients[prevOrient]);
                          }
                          buf += (sides[j % 6]);
                          if (syntax == 'SUFFIX') {
                            buf += (sideOrients[prevOrient]);
                          }
                          if (hasEvenLayerCount) {
                            buf += (j / 6 + 1);
                          } else {
                            if (j >= 6) {
                              buf += (j / 6);
                            }
                          }
                        }
                        j = cycle[cycleStart];
                        prevOrient = (prevOrient + sideOrient[j]) % 4;
                        if (syntax == 'POSTCIRCUMFIX') {
                          p = buf.length;
                          buf += (tEnd);
                        } else if (syntax == 'SUFFIX') {
                          buf += (tEnd);
                          p = buf.length;
                        } else {
                          buf += (tEnd);
                        }
                        if (prevOrient != 0) {
                          buf = buf.substring(0, p) + (sideOrients[prevOrient]) + buf.substring(p);
                        }
                      }
                    }
                  }
                }
              }
            }
            return buf;
          }
        }
        Cube.prototype.CORNER_PART = 0;
        Cube.prototype.EDGE_PART = 1;
        Cube.prototype.SIDE_PART = 2;
        Cube.prototype.CENTER_PART = 3;
        Cube.prototype.NUMBER_OF_CORNER_PARTS = 8;
        Cube.prototype.listenerList = [];
        Cube.prototype.quiet = false;
        Cube.prototype.layerCount;
        Cube.prototype.cornerLoc = [];
        Cube.prototype.cornerOrient = [];
        Cube.prototype.edgeLoc = [];
        Cube.prototype.edgeOrient = [];
        Cube.prototype.sideLoc = [];
        Cube.prototype.sideOrient = [];
        Cube.prototype.IDENTITY_TRANSFORM = 0;
        Cube.prototype.SINGLE_AXIS_TRANSFORM = 1;
        Cube.prototype.GENERAL_TRANSFORM = 2;
        Cube.prototype.UNKNOWN_TRANSFORM = 3;
        Cube.prototype.transformType = 0;
        Cube.prototype.transformAxis = 0;
        Cube.prototype.transformAngle = 0;
        Cube.prototype.transformMask = 0;
        Cube.prototype.CORNER_TO_FACE_MAP = [
          [1, 0, 2],
          [4, 2, 0],
          [1, 5, 0],
          [4, 0, 5],
          [1, 3, 5],
          [4, 5, 3],
          [1, 2, 3],
          [4, 3, 2]
        ];
        Cube.prototype.EDGE_TO_AXIS_MAP = [
          2,
          1,
          2,
          0,
          1,
          0,
          2,
          1,
          2,
          0,
          1,
          0
        ];
        Cube.prototype.EDGE_TO_ANGLE_MAP = [
          [1, -1],
          [1, -1],
          [-1, 1],
          [-1, 1],
          [-1, 1],
          [1, -1],
          [-1, 1],
          [1, -1],
          [1, -1],
          [1, -1],
          [-1, 1],
          [-1, 1]
        ];
        Cube.prototype.EDGE_TO_FACE_MAP = [
          [1, 0],
          [0, 2],
          [4, 0],
          [5, 1],
          [0, 5],
          [5, 0],
          [1, 3],
          [3, 5],
          [4, 3],
          [2, 1],
          [3, 2],
          [2, 4]
        ];
        Cube.prototype.CENTER_TO_SIDE_MAP = [
          [0, 1, 2, 3, 4, 5],
          [5, 1, 0, 2, 4, 3],
          [3, 1, 5, 0, 4, 2],
          [2, 1, 3, 5, 4, 0], // 3: Top, Right, CR'
          [4, 0, 2, 1, 3, 5],
          [3, 4, 2, 0, 1, 5],
          [1, 3, 2, 4, 0, 5], // 6: // Left, Front, CU'
          [0, 2, 4, 3, 5, 1],
          [0, 4, 5, 3, 1, 2],
          [0, 5, 1, 3, 2, 4], // 9: // Front, Bottom, CF'
          [5, 0, 4, 2, 3, 1],
          [5, 4, 3, 2, 1, 0],
          [5, 3, 1, 2, 0, 4], // 12: // Left, Down, CR CU'
          [1, 0, 5, 4, 3, 2],
          [4, 3, 5, 1, 0, 2], // 14: // Left, Back, CR2 CU'
          [2, 0, 1, 5, 3, 4], // 15: // Right, Down, CR' CU
          [2, 4, 0, 5, 1, 3], // 16: // Down, Left, CR' CU2
          [2, 3, 4, 5, 0, 1], // 17: // Left, Up, CR' CU'
          [1, 2, 0, 4, 5, 3],
          [4, 5, 0, 1, 2, 3], // 19: // Down, Back, CR CF'
          [3, 2, 1, 0, 5, 4],
          [3, 5, 4, 0, 2, 1], // 21: // Back, Up, CR2 CF'
          [4, 2, 3, 1, 5, 0], // 22: // Up, Back, CR' CF
          [1, 5, 3, 4, 2, 0] // 23: // Up, Front, CR' CF'
        ];
        Cube.prototype.CORNER_SWIPE_TABLE = [
          [
            [
              [2, 4, 1],
              [0, 4, -1],
              [2, 4, -1],
              [0, 4, 1]
            ],
            [
              [1, 4, 1],
              [2, 4, -1],
              [1, 4, -1],
              [2, 4, 1]
            ],
            [
              [0, 4, -1],
              [1, 4, 1],
              [0, 4, 1],
              [1, 4, -1]
            ]
          ], [
            [
              [0, 4, 1],
              [2, 4, -1],
              [0, 4, -1],
              [2, 4, 1]
            ],
            [
              [1, 1, -1],
              [0, 4, -1],
              [1, 1, 1],
              [0, 4, 1]
            ],
            [
              [2, 4, -1],
              [1, 1, -1],
              [2, 4, 1],
              [1, 1, 1]
            ]
          ], [
            [
              [0, 4, 1],
              [2, 1, 1],
              [0, 4, -1],
              [2, 1, -1]
            ],
            [
              [1, 4, 1],
              [0, 4, -1],
              [1, 4, -1],
              [0, 4, 1]
            ],
            [
              [2, 1, 1],
              [1, 4, 1],
              [2, 1, -1],
              [1, 4, -1]
            ]
          ], [
            [
              [2, 1, -1],
              [0, 4, -1],
              [2, 1, 1],
              [0, 4, 1]
            ],
            [
              [1, 1, -1],
              [2, 1, 1],
              [1, 1, 1],
              [2, 1, -1]
            ],
            [
              [0, 4, -1],
              [1, 1, -1],
              [0, 4, 1],
              [1, 1, 1]
            ]
          ], [
            [
              [2, 1, -1],
              [0, 1, 1],
              [2, 1, 1],
              [0, 1, -1]
            ],
            [
              [1, 4, 1],
              [2, 1, 1],
              [1, 4, -1],
              [2, 1, -1]
            ],
            [
              [0, 1, 1],
              [1, 4, 1],
              [0, 1, -1],
              [1, 4, -1]
            ]
          ], [
            [
              [0, 1, -1],
              [2, 1, 1],
              [0, 1, 1],
              [2, 1, -1]
            ],
            [
              [1, 1, -1],
              [0, 1, 1],
              [1, 1, 1],
              [0, 1, -1]
            ],
            [
              [2, 1, 1],
              [1, 1, -1],
              [2, 1, -1],
              [1, 1, 1]
            ]
          ], [
            [
              [0, 1, -1],
              [2, 4, -1],
              [0, 1, 1],
              [2, 4, 1]
            ],
            [
              [1, 4, 1],
              [0, 1, 1],
              [1, 4, -1],
              [0, 1, -1]
            ],
            [
              [2, 4, -1],
              [1, 4, 1],
              [2, 4, 1],
              [1, 4, -1]
            ]
          ], [
            [
              [2, 4, 1],
              [0, 1, 1],
              [2, 4, -1],
              [0, 1, -1]
            ],
            [
              [1, 1, -1],
              [2, 4, -1],
              [1, 1, 1],
              [2, 4, 1]
            ],
            [
              [0, 1, 1],
              [1, 1, -1],
              [0, 1, -1],
              [1, 1, 1]
            ]
          ]
        ];
        return {
          Cube: Cube
        };
      });
    'use strict';
    define('Cube3D', ['Node3D', 'J3DIMath'],
      function (Node3D, J3DIMath) {
        class ChangeEvent {
          constructor(source) {
            this.source = source;
          }
        }
        class Cube3D extends Node3D.Node3D {
          constructor() {
            super();
            this.cube = null;
            this.cornerCount = 0;
            this.edgeCount = 0;
            this.sideCount = 0;
            this.centerCount = 0;
            this.partCount = 0;
            this.cornerOffset = 0;
            this.edgeOffset = 0;
            this.sideOffset = 0;
            this.centerOffset = 0;
            this.repainter = null;
            this.isTwisting = false;
            this.repaintFunction = null;
            this.parts = [];
            this.partOrientations = [];
            this.partExplosions = [];
            this.partLocations = [];
            this.stickers = [];
            this.stickerOrientations = [];
            this.stickerExplosions = [];
            this.stickerLocations = [];
            this.stickerTranslations = [];
            this.identityPartLocations = [];
            this.identityStickerLocations = [];
            this.listenerList = [];
            this.isCubeValid = false;
            this.updateTwistRotation = new J3DIMatrix4();
            this.updateTwistOrientation = new J3DIMatrix4();
            this.partSize = 3;
            this.developedStickerTranslations = [];
            this.developedStickers = [];
            this.identityDevelopedMatrix = [];
            this.currentStickerTransforms = [];
          }

          cubeChanged(evt) {
            this.updateCube();
          }

          cubeTwisted(evt) {
            this.updateCube();
          }

          updateCube() {
            this.isCubeValid = false;
            this.validateCube();
            this.fireStateChanged();
          }

          validateCube() {
            if (!this.isCubeValid) {
              this.isCubeValid = true;
              const model = this.cube;
              const partIndices = new Array(this.partCount);
              const locations = new Array(this.partCount);
              const orientations = new Array(this.partCount);
              for (let i = 0; i < this.partCount; i++) {
                locations[i] = i;
                partIndices[i] = model.getPartAt(locations[i]);
                orientations[i] = model.getPartOrientation(partIndices[i]);
              }
              this.validateTwist(partIndices, locations, orientations, this.partCount, 0, 0, 1);
            }
          }

          updateAttributes() {
            this.isAttributesValid = false;
            this.validateAttributes();
          }

          validateAttributes() {
            if (!this.isAttributesValid) {
              this.isAttributesValid = true;
              this.doValidateDevelopAttributes();
              this.doValidateAttributes();
            }
          }

          doValidateAttributes() {
          }

          doValidateDevelopAttributes() {
            if (this.attributes.developmentFactor == this.cachedDevelopmentFactor) {
              return;
            }
            this.cachedDevelopmentFactor = this.attributes.developmentFactor;
            const m1 = new J3DIMatrix4();
            const m2 = new J3DIMatrix4();
            for (let i = 0; i < this.stickerCount; i++) {
              const j = this.stickerToPartMap[i];
              m1.load(this.partLocations[j].matrix);
              m1.multiply(this.partExplosions[j].matrix);
              m1.multiply(this.partOrientations[j].matrix);
              m1.multiply(this.parts[j].matrix);
              m2.load(this.stickerTranslations[i].matrix);
              m2.multiply(this.stickerLocations[i].matrix);
              m2.multiply(this.stickerExplosions[i].matrix);
              m2.multiply(this.stickerOrientations[i].matrix);
              m2.multiply(this.stickers[i].matrix);
              this.currentStickerTransforms[i].matrix.load(J3DIMath.rigidLerp(m1, m2, this.attributes.developmentFactor));
            }
          }

          addChangeListener(l) {
            this.listenerList[this.listenerList.length] = l;
          }

          removeChangeListener(l) {
            for (let i = 0; i < this.listenerList.length; i++) {
              if (this.listenerList[i] == l) {
                this.listenerList = this.listenerList.slice(0, i) + this.listenerList.slice(i + 1);
                break;
              }
            }
          }

          fireStateChanged() {
            const event = new ChangeEvent(this);
            const listeners = this.listenerList;
            for (let i = listeners.length - 1; i >= 0; i -= 1) {
              listeners[i].stateChanged(event);
            }
          }

          repaint() {
            if (this.repaintFunction != null) {
              this.repaintFunction();
            }
          }

          intersect(ray) {
            const cubeSize = this.partSize * this.cube.layerCount;
            const box = {
              pMin: new J3DIVector3(-cubeSize / 2, -cubeSize / 2, -cubeSize / 2),
              pMax: new J3DIVector3(cubeSize / 2, cubeSize / 2, cubeSize / 2)
            };
            let isect = J3DIMath.intersectBox(ray, box);
            if (isect != null) {
              const face = isect.face;
              const u = Math.floor(isect.uv[0] * this.cube.layerCount);
              const v = Math.floor(isect.uv[1] * this.cube.layerCount);
              isect.location = this.boxClickToLocationMap[face][u][v];
              isect.axis = this.boxClickToAxisMap[face][u][v];
              isect.layerMask = this.boxClickToLayerMap[face][u][v];
              isect.angle = this.boxClickToAngleMap[face][u][v];
              isect.part = this.cube.getPartAt(isect.location);
              if (!this.attributes.isPartVisible(isect.part)) {
                isect = null;
              }
            }
            return isect;
          }

          intersectDeveloped(ray) {
            let isect = null;
            const plane = { point: new J3DIVector3(), normal: new J3DIVector3() };
            const m = new J3DIMatrix4();
            const layerCount = this.cube.layerCount;
            const partSize = this.partSize;
            plane.point.load(0, 0, -0.5 * layerCount * this.partSize);
            plane.normal.load(0, 0, -1);
            isect = J3DIMath.intersectPlane(ray, plane);
            if (isect != null) {
              const tileU = -1 - Math.floor((isect.uv[0] - (1.5 * layerCount * partSize)) / partSize);
              const tileV = Math.floor((isect.uv[1] + (1.5 * layerCount * partSize)) / partSize);
              if (tileV >= 0 && tileV < layerCount &&
          tileU >= layerCount && tileU < layerCount * 2) {
                isect.face = 1;
              } else if (tileV >= layerCount && tileV < layerCount * 2 &&
          tileU >= 0 && tileU < (layerCount * 4)) {
                switch (Math.floor(tileU / layerCount)) {
                  case 0:
                    isect.face = 3;
                    break;
                  case 1:
                    isect.face = 2;
                    break;
                  case 2:
                    isect.face = 0;
                    break;
                  case 3:
                    isect.face = 5;
                    break;
                  default:
                    return null;
                }
              } else if (tileV >= layerCount * 2 && tileV < layerCount * 3 &&
          tileU >= layerCount && tileU < layerCount * 2) {
                isect.face = 4;
              } else {
                return null;
              }
              isect.sticker = isect.face * layerCount * layerCount + (tileV % layerCount) * layerCount + tileU % layerCount;
              isect.part = this.getPartIndexForStickerIndex(isect.sticker);
              isect.plane = plane;
            }
            return isect;
          }

          getCube() {
            return this.cube;
          }
        }
        return {
          Cube3D: Cube3D
        };
      });
    'use strict';
    define('CubeAttributes', [],
      function () {
        const module = {
          log: (false) ? console.log : () => {},
          info: (true) ? console.info : () => {},
          warning: (true) ? console.warning : () => {},
          error: (true) ? console.error : () => {}
        };
        class CubeAttributes {
          constructor(partCount, stickerCount, stickerCountPerFace) {
            this.partsVisible = new Array(partCount);
            this.partsFillColor = new Array(partCount);
            this.partsPhong = new Array(partCount);
            this.stickersVisible = new Array(stickerCount);
            this.stickersFillColor = new Array(stickerCount);
            this.stickersPhong = new Array(stickerCount);
            this.stickerCountPerFace = stickerCountPerFace;
            this.partExplosion = new Array(partCount);
            this.stickerExplosion = new Array(stickerCount);
            this.xRot = -25;
            this.yRot = -45;
            this.scaleFactor = 1.0;
            this.explosionFactor = 0;
            this.developmentFactor = 0;
            this.stickersImageURL = null;
            this.twistDuration = 500;
            this.userTwistDuration = 500;
            this.scrambleTwistDuration = 500 / 3;
            this.backgroundColor = [0, 0, 0, 0];
            for (let i = 0; i < partCount; i++) {
              this.partsVisible[i] = true;
              this.stickersVisible[i] = true;
              this.partExplosion[i] = 0;
            }
            this.faceCount = undefined;
            this.stickerOffsets = [];
            this.stickerCounts = [];
          }

          getFaceCount() {
            return this.faceCount;
          }

          getStickerOffset(face) {
            return this.stickerOffsets[face];
          }

          getStickerCount(face) {
            return this.stickerCounts[face];
          }

          getPartCount() {
            return this.partsVisible.length;
          }

          setPartVisible(partIndex, newValue) {
            this.partsVisible[partIndex] = newValue;
          }

          isPartVisible(partIndex) {
            return this.partsVisible[partIndex];
          }
        }
        return {
          CubeAttributes: CubeAttributes,
          newCubeAttributes: function (partCount, stickerCount, stickerCountPerFace) { return new CubeAttributes(partCount, stickerCount, stickerCountPerFace); }
        };
      });
    'use strict';
    define('CubeSolverMain', ['WebglSolverCanvas', 'TwoDSolverCanvas'],
      function (WebglSolverCanvas, TwoDSolverCanvas) {
        let nextId = 0;
        function attachCubeSolver(divOrCanvas) {
          if (document.body == null) {
            var f = function () {
              try {
                window.removeEventListener('load', f, false);
              } catch (err) {
                window.detachEvent('onload', f, false);
              }
              attachCubeSolver(divOrCanvas);
            };
            try {
              window.addEventListener('load', f, false);
            } catch (err) {
              window.attachEvent('onload', f, false);
            }
            return;
          }
          const console = ('console' in window) ? window.console : { log: function () { } };
          if (divOrCanvas == null) {
            try {
              var htmlCollection = document.getElementsByClassName('cubesolver');
              if (htmlCollection.length == 0) {
                console.log('Error: cubesolver.js no canvas or div element with class name "cubesolver" found.');
                return;
              }
            } catch (err) {
              return;
            }
            for (i = 0; i < htmlCollection.length; i++) {
              const elem = htmlCollection[i];
              attachCubeSolver(elem);
            }
          } else {
            let canvasElem = null;
            if (divOrCanvas.tagName == 'CANVAS') {
              canvasElem = divOrCanvas;
            } else if (divOrCanvas.tagName == 'DIV') {
              while (divOrCanvas.lastChild) {
                divOrCanvas.removeChild(divOrCanvas.lastChild);
              }
              const id = 'cubesolver_' + nextId++;
              canvasElem = document.createElement('canvas');
              canvasElem.setAttribute('class', 'cubesolvercanvas');
              canvasElem.setAttribute('id', id);
              canvasElem.setAttribute('cube', divOrCanvas.getAttribute('cube'));
              canvasElem.setAttribute('stickersimage', divOrCanvas.getAttribute('stickersimage'));
              canvasElem.setAttribute('debug', divOrCanvas.getAttribute('debug'));
              divOrCanvas.appendChild(canvasElem);
              const toolbarElem = document.createElement('div');
              toolbarElem.setAttribute('class', 'cubesolvertoolbar');
              divOrCanvas.appendChild(toolbarElem);
              let buttonElem;
              buttonElem = document.createElement('button');
              buttonElem.setAttribute('type', 'button');
              buttonElem.setAttribute('class', 'cubesolverreset');
              buttonElem.setAttribute('onclick', "document.getElementById('" + id + "').cubesolver.reset();");
              buttonElem.appendChild(document.createTextNode('Reset'));
              toolbarElem.appendChild(buttonElem);
              buttonElem = document.createElement('button');
              buttonElem.setAttribute('type', 'button');
              buttonElem.setAttribute('class', 'cubesolversolve');
              buttonElem.setAttribute('onclick', "document.getElementById('" + id + "').cubesolver.solve();");
              buttonElem.appendChild(document.createTextNode('Solve'));
              toolbarElem.appendChild(buttonElem);
              buttonElem = document.createElement('button');
              buttonElem.setAttribute('type', 'button');
              buttonElem.setAttribute('class', 'cubesolverundo');
              buttonElem.setAttribute('onclick', "document.getElementById('" + id + "').cubesolver.undo();");
              buttonElem.appendChild(document.createTextNode('Undo'));
              toolbarElem.appendChild(buttonElem);
            } else {
              console.log('Error: cubesolver.js element ' + divOrCanvas + ' is not a canvas or a div. tagName=' + divOrCanvas.tagName);
              return;
            }
            const vr = new CubeSolver(canvasElem);
            vr.init();
            canvasElem.cubesolver = vr;
          }
        }
        CubeSolver = function (canvas) {
          this.canvas = canvas;
        };
        CubeSolver.prototype.init = function () {
          this.canvas3d = WebglSolverCanvas.newWebGLSolverCanvas();
          let s = this.canvas3d.setCanvas(this.canvas);
          if (!s) {
            this.canvas3d = TwoDSolverCanvas.newTwoDSolverCanvas();
            s = this.canvas3d.setCanvas(this.canvas);
          }
        };
        CubeSolver.prototype.reset = function () {
          this.canvas3d.reset();
        };
        CubeSolver.prototype.scramble = function (scrambleCount, animate) {
          this.canvas3d.scramble(scrambleCount, animate);
        };
        CubeSolver.prototype.play = function () {
          this.canvas3d.play();
        };
        CubeSolver.prototype.solve = function () {
          this.canvas3d.solve();
        };
        CubeSolver.prototype.undo = function () {
          this.canvas3d.undo();
        };
        CubeSolver.prototype.wobble = function () {
          this.canvas3d.wobble();
        };
        CubeSolver.prototype.explode = function () {
          this.canvas3d.explode();
        };
        CubeSolver.prototype.setAutorotate = function (newValue) {
          this.canvas3d.setAutorotate(newValue);
        };
        return {
          attachCubeSolver: attachCubeSolver
        };
      });
    /*
  * @(#)J3DI.js  2.0  2013-12-31
  * Copyright (c) 2011 Werner Randelshofer, Switzerland.
  * You may only use this software in accordance with the license terms.
  *
  * Portions of this script (as marked) have been taken from the following sources:
  *
  *   David Roe
  *   http:
  *
  *   Apple Inc.
  *   The J3DI.js file as linked from:
  *   https:
  *
  *     Copyright (C) 2009 Apple Inc. All Rights Reserved.
  *
  *     Redistribution and use in source and binary forms, with or without
  *     modification, are permitted provided that the following conditions
  *     are met:
  *     1. Redistributions of source code must retain the above copyright
  *        notice, this list of conditions and the following disclaimer.
  *     2. Redistributions in binary form must reproduce the above copyright
  *        notice, this list of conditions and the following disclaimer in the
  *        documentation and/or other materials provided with the distribution.
  *
  *     This software is provided by apple inc. ``as is'' and any
  *     express or implied warranties, including, but not limited to, the
  *     implied warranties of merchantability and fitness for a particular
  *     purpose are disclaimed.  in no event shall apple inc. or
  *     contributors be liable for any direct, indirect, incidental, special,
  *     exemplary, or consequential damages (including, but not limited to,
  *     procurement of substitute goods or services; loss of use, data, or
  *     profits; or business interruption) however caused and on any theory
  *     of liability, whether in contract, strict liability, or tort
  *     (including negligence or otherwise) arising in any way out of the use
  *     of this software, even if advised of the possibility of such damage.
  *
  *
  *   Google Inc.
  *   The easywebgl.js file as linked from:
  *   https:
  *
  *     Copyright 2010, Google Inc.
  *     All rights reserved.
  *
  *     Redistribution and use in source and binary forms, with or without
  *     modification, are permitted provided that the following conditions are
  *     met:
  *
  *         * Redistributions of source code must retain the above copyright
  *     notice, this list of conditions and the following disclaimer.
  *         * Redistributions in binary form must reproduce the above
  *     copyright notice, this list of conditions and the following disclaimer
  *     in the documentation and/or other materials provided with the
  *     distribution.
  *         * Neither the name of Google Inc. nor the names of its
  *     contributors may be used to endorse or promote products derived from
  *     this software without specific prior written permission.
  *
  *     This software is provided by the copyright holders and contributors
  *     "as is" and any express or implied warranties, including, but not
  *     limited to, the implied warranties of merchantability and fitness for
  *     a particular purpose are disclaimed. in no event shall the copyright
  *     owner or contributors be liable for any direct, indirect, incidental,
  *     special, exemplary, or consequential damages (including, but not
  *     limited to, procurement of substitute goods or services; loss of use,
  *     data, or profits; or business interruption) however caused and on any
  *     theory of liability, whether in contract, strict liability, or tort
  *     (including negligence or otherwise) arising in any way out of the use
  *     of this software, even if advised of the possibility of such damage.
  */
    'use strict';
    define('J3DI', [],
      function () {
        const module = {
          log: (false) ? console.log : () => {},
          info: (true) ? console.info : () => {},
          warning: (true) ? console.warning : () => {},
          error: (true) ? console.error : () => {}
        };
        const requestAnimFrame = (function () {
          return function (/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
            window.setTimeout(callback, 1000 / 60);
          };
        })();
        class J3DIObj {
          constructor() {
            this.loaded = false;
            this.gl = null;
            this.url = null;
            this.normalArray = null;
            this.textureArray = null;
            this.vertexArray = null;
            this.numIndices = null;
            this.indexArray = null;
            this.groups = null;
            this.normalBuffer = null;
            this.textureBuffer = null;
            this.vertexBuffer = null;
            this.indexBuffer = null;
            this.textureOffsetX = 0;
            this.textureOffsetY = 0;
            this.textureScale = 1;
            this.visible = true;
          }

          setTo(that) {
            this.url = that.url;
            this.loaded = that.loaded;
            this.normalArray = that.normalArray;
            this.textureArray = that.textureArray;
            this.vertexArray = that.vertexArray;
            this.numIndices = that.numIndices;
            this.indexArray = that.indexArray;
            this.polyIndexArray = that.polyIndexArray;
            this.groups = that.groups;
          }

          clone() {
            const that = new J3DIObj();
            that.setTo(this);
            return that;
          }

          bindGL(gl) {
            if (!this.loaded) { return; }
            if (this.gl != gl) {
              this.gl = gl;
              this.normalBuffer = null;
              this.textureBuffer = null;
              this.vertexBuffer = null;
              this.indexBuffer = null;
              this.updateGL();
            }
          }

          updateGL() {
            const gl = this.gl;
            if (gl == null || !this.loaded) { return; }
            if (this.normalBuffer == null) {
              this.normalBuffer = gl.createBuffer();
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normalArray), gl.STATIC_DRAW);
            if (this.textureBuffer == null) {
              this.textureBuffer = gl.createBuffer();
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textureArray), gl.STATIC_DRAW);
            if (this.vertexBuffer == null) {
              this.vertexBuffer = gl.createBuffer();
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexArray), gl.STATIC_DRAW);
            if (this.indexBuffer == null) {
              this.indexBuffer = gl.createBuffer();
            }
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indexArray), gl.STREAM_DRAW);
          }

          flipTexture(u, v) {
            for (let i = 0; i < this.textureArray.length; i += 2) {
              if (u) { this.textureArray[i] = 1 - this.textureArray[i]; }
              if (v) { this.textureArray[i + 1] = 1 - this.textureArray[i + 1]; }
            }
          }

          rotateTexture(degree) {
            if (!this.loaded) { return; }
            this.textureArray = this.textureArray.slice(0);
            switch (degree % 360) {
              case 0:
                break;
              default:
              case 90:
                for (let i = 0; i < this.textureArray.length; i += 2) {
                  const t = this.textureArray[i];
                  this.textureArray[i] = this.textureArray[i + 1];
                  this.textureArray[i + 1] = 1 - t;
                }
                break;
              case 180:
                for (let i = 0; i < this.textureArray.length; i += 2) {
                  this.textureArray[i] = 1 - this.textureArray[i];
                  this.textureArray[i + 1] = 1 - this.textureArray[i + 1];
                }
                break;
              case 270:
                for (let i = 0; i < this.textureArray.length; i += 2) {
                  const t = this.textureArray[i];
                  this.textureArray[i] = 1 - this.textureArray[i + 1];
                  this.textureArray[i + 1] = t;
                }
                break;
            }
          }
        }
        const initWebGL = function (canvasName, vshader, fshader, attribs, uniforms, clearColor, clearDepth, optAttribs, callback, errorCallback) {
          let canvas;
          if (typeof (canvasName) === 'string') {
            canvas = document.getElementById(canvasName);
          } else {
            canvas = canvasName;
          }
          const gl = setupWebGL(canvas, optAttribs, errorCallback == null);
          if (gl == null || typeof (gl) === 'string' || (gl instanceof String)) {
            if (errorCallback) {
              errorCallback(gl);
            }
            return null;
          }
          checkGLError(gl, 'easywebgl.initWebGL setupWebGL');
          if (gl.programs == null) {
            gl.programs = Array();
          }
          let files = [];
          if (typeof vshader !== 'object' || !('length' in vshader)) {
            vshader = [vshader];
          }
          if (typeof fshader !== 'object' || !('length' in fshader)) {
            fshader = [fshader];
          }
          files = vshader.concat(fshader);
          module.log('loading files: %o', files);
          checkGLError(gl, 'easywebgl.initWebGL before loadFiles');
          loadFiles(files,
            function (shaderText) {
              checkGLError(gl, 'easywebgl.initWebGL loadFiles callback');
              const programCount = shaderText.length / 2;
              for (let programIndex = 0; programIndex < programCount; programIndex++) {
                checkGLError(gl, 'easywebgl.initWebGL before loadShader ' + programIndex);
                const vertexShader = loadShader(gl, vshader[programIndex], shaderText[programIndex], gl.VERTEX_SHADER);
                const fragmentShader = loadShader(gl, fshader[programIndex], shaderText[programIndex + programCount], gl.FRAGMENT_SHADER);
                if (!vertexShader || !fragmentShader) {
                  if (errorCallback) { errorCallback('Error compiling shaders.'); } else { module.log('Error compiling shaders.'); }
                  return null;
                }
                gl.programs[programIndex] = gl.createProgram();
                checkGLError(gl, 'easywebgl.initWebGL createProgram ' + programIndex);
                const prg = gl.programs[programIndex];
                prg.vshaderId = vshader[programIndex];
                prg.fshaderId = fshader[programIndex];
                if (!prg) { return null; }
                gl.attachShader(prg, vertexShader);
                checkGLError(gl, 'easywebgl.initWebGL attach vertex shader');
                gl.attachShader(prg, fragmentShader);
                checkGLError(gl, 'easywebgl.initWebGL attach fragment shader');
                gl.linkProgram(prg);
                checkGLError(gl, 'easywebgl.initWebGL linkProgram');
                const linked = gl.getProgramParameter(prg, gl.LINK_STATUS);
                if (!linked) {
                  const error = gl.getProgramInfoLog(prg);
                  module.log('Error in program linking:' + error);
                  gl.deleteProgram(prg);
                  gl.deleteShader(fragmentShader);
                  gl.deleteShader(vertexShader);
                  return null;
                }
                prg.attribs = [];
                for (let i = 0; i < attribs.length; ++i) {
                  prg.attribs[attribs[i]] = gl.getAttribLocation(prg, attribs[i]);
                  if (prg.attribs[attribs[i]] != -1) {
                  }
                }
                prg.uniforms = [];
                for (let i = 0; i < uniforms.length; ++i) {
                  prg.uniforms[uniforms[i]] = gl.getUniformLocation(prg, uniforms[i]);
                  module.log('.initWebGL ' + prg.vshaderId + ' prg.uniform[' + uniforms[i] + ']=' + prg.uniforms[uniforms[i]]);
                }
                gl.useProgram(gl.programs[programIndex]);
                checkGLError(gl, 'easywebgl.initWebGL useProgram ' + prg.vshaderId + ',' + prg.fshaderId);
              }
              if (callback) { callback(gl); }
            },
            function (url) {
              if (errorCallback) { errorCallback(url); } else { module.log('Failed to download "' + url + '"'); }
            }
          );
          checkGLError(gl, 'easywebgl.initWebGL before clear');
          gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
          gl.clearDepth(clearDepth);
          gl.enable(gl.DEPTH_TEST);
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
          checkGLError(gl, 'easywebgl.initWebGL after clear');
          return gl;
        };
        const checkGLError = function (gl, msg) {
          const error = gl.getError();
          if (error != gl.NO_ERROR) {
            const str = 'GL Error: ' + error + (msg == null ? '' : ' ' + msg);
            module.log(str);
          }
        };
        const loadShader = function (ctx, shaderId, shaderScript, shaderType) {
          module.log('.loadShader(' + ctx + ',' + shaderId + ',' + (shaderScript == null ? null : shaderScript.substring(0, Math.min(shaderScript.length, 10))) + ',' + shaderType);
          checkGLError(ctx, 'easywebgl.loadShader before createShader ' + shaderType);
          const shader = ctx.createShader(shaderType);
          checkGLError(ctx, 'easywebgl.loadShader createShader ' + shaderType);
          if (shader == null) {
            module.error("*** Error: unable to create shader '" + shaderId + "' error:" + ctx.getError());
            return null;
          }
          ctx.shaderSource(shader, shaderScript);
          ctx.compileShader(shader);
          const compiled = ctx.getShaderParameter(shader, ctx.COMPILE_STATUS);
          if (!compiled) {
            const error = ctx.getShaderInfoLog(shader);
            module.error("*** Error compiling shader '" + shaderId + "':" + error);
            ctx.deleteShader(shader);
            return null;
          }
          return shader;
        };
        const fileData = {};
        const setFileData = function (url, data) {
          module.log('.setFileData ' + url);
          if (data === null) {
            delete fileData[url];
          } else {
            fileData[url] = data;
          }
        };
        const loadFile = function (url, data, callback, errorCallback) {
          for (const key in fileData) {
            if (url.endsWith(key)) {
              module.log('.loadFile url:' + url + ' using preloaded data');
              if (callback) {
                const f = function () {
                  callback(fileData[key], data);
                };
                requestAnimFrame(f);
              }
              return;
            }
          }
          const scriptElem = document.getElementById(url);
          if (scriptElem) {
            if (scriptElem.text) {
              module.log('.loadFile url:' + url + ' using data from script element');
              if (callback) {
                const f = function () {
                  callback(scriptElem.text, data);
                };
                requestAnimFrame(f);
              }
              return;
            } else {
              url = scriptElem.src;
            }
          }
          module.log('.loadFile url:' + url + ' requesting data...');
          const request = new XMLHttpRequest();
          request.open('GET', url, true);
          request.onreadystatechange = function () {
            if (request.readyState == 4) {
              if (request.status == 200 || request.status == 0) {
                module.log('.loadFile url:' + url + ' done, request.status:' + request.status);
                if (callback) {
                  callback(request.responseText, data);
                }
              } else {
                module.log('.loadFile url:' + url + ' failed, request.status:' + request.status);
                if (errorCallback) {
                  errorCallback(url);
                }
              }
            }
          };
          request.send(null);
        };
        const loadXML = function (url, data, callback, errorCallback) {
          const scriptElem = document.getElementById(url);
          if (scriptElem) {
            if (scriptElem.text) {
              callback(scriptElem.text, data);
              return;
            } else {
              url = scriptElem.src;
            }
          }
          module.log('.loadXML url=' + url);
          const request = new XMLHttpRequest();
          request.open('GET', url, true);
          request.onreadystatechange = function () {
            if (request.readyState == 4) {
              if (request.status == 200) {
                callback(request.responseXML, data);
              } else {
                errorCallback(url);
              }
            }
          };
          request.send(null);
        };
        const loadFiles = function (urls, callback, errorCallback) {
          const numUrls = urls.length;
          let numComplete = 0;
          const result = [];
          function partialCallback(text, urlIndex) {
            result[urlIndex] = text;
            numComplete++;
            if (numComplete == numUrls) {
              callback(result);
            }
          }
          for (let i = 0; i < numUrls; i++) {
            loadFile(urls[i], i, partialCallback, errorCallback);
          }
        };
        const makeBox = function (ctx, bmin, bmax) {
          if (bmin == null) { bmin = new J3DIVector3(-1, -1, -1); }
          if (bmax == null) { bmax = new J3DIVector3(1, 1, 1); }
          const vertices = new Float32Array(
            [bmax[0], bmax[1], bmax[2], bmin[0], bmax[1], bmax[2], bmin[0], bmin[1], bmax[2], bmax[0], bmin[1], bmax[2],
              bmax[0], bmax[1], bmax[2], bmax[0], bmin[1], bmax[2], bmax[0], bmin[1], bmin[2], bmax[0], bmax[1], bmin[2],
              bmax[0], bmax[1], bmax[2], bmax[0], bmax[1], bmin[2], bmin[0], bmax[1], bmin[2], bmin[0], bmax[1], bmax[2],
              bmin[0], bmax[1], bmax[2], bmin[0], bmax[1], bmin[2], bmin[0], bmin[1], bmin[2], bmin[0], bmin[1], bmax[2],
              bmin[0], bmin[1], bmin[2], bmax[0], bmin[1], bmin[2], bmax[0], bmin[1], bmax[2], bmin[0], bmin[1], bmax[2],
              bmax[0], bmin[1], bmin[2], bmin[0], bmin[1], bmin[2], bmin[0], bmax[1], bmin[2], bmax[0], bmax[1], bmin[2]]
          );
          const normals = new Float32Array(
            [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
              1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
              0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
              -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
              0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
              0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1]
          );
          const texCoords = new Float32Array(
            [1, 1, 0, 1, 0, 0, 1, 0,
              0, 1, 0, 0, 1, 0, 1, 1,
              1, 0, 1, 1, 0, 1, 0, 0,
              1, 1, 0, 1, 0, 0, 1, 0,
              0, 0, 1, 0, 1, 1, 0, 1,
              0, 0, 1, 0, 1, 1, 0, 1]
          );
          const indices = new Uint16Array(
            [0, 2, 1, 0, 3, 2,
              4, 6, 5, 4, 7, 6,
              8, 10, 9, 8, 11, 10,
              12, 14, 13, 12, 15, 14,
              16, 18, 17, 16, 19, 18,
              20, 22, 21, 20, 23, 22]
          );
          const retval = {};
          retval.normalBuffer = ctx.createBuffer();
          ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.normalBuffer);
          ctx.bufferData(ctx.ARRAY_BUFFER, normals, ctx.STATIC_DRAW);
          retval.texCoordObject = ctx.createBuffer();
          ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.texCoordObject);
          ctx.bufferData(ctx.ARRAY_BUFFER, texCoords, ctx.STATIC_DRAW);
          retval.vertexBuffer = ctx.createBuffer();
          ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.vertexBuffer);
          ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);
          ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
          retval.indexBuffer = ctx.createBuffer();
          ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, retval.indexBuffer);
          ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, indices, ctx.STATIC_DRAW);
          ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);
          retval.numIndices = indices.length;
          retval.loaded = true;
          return retval;
        };
        const makeSphere = function (ctx, radius, lats, longs) {
          const geometryData = [];
          const normalData = [];
          const texCoordData = [];
          const indexData = [];
          for (let latNumber = 0; latNumber <= lats; ++latNumber) {
            for (let longNumber = 0; longNumber <= longs; ++longNumber) {
              const theta = latNumber * Math.PI / lats;
              const phi = longNumber * 2 * Math.PI / longs;
              const sinTheta = Math.sin(theta);
              const sinPhi = Math.sin(phi);
              const cosTheta = Math.cos(theta);
              const cosPhi = Math.cos(phi);
              const x = cosPhi * sinTheta;
              const y = cosTheta;
              const z = sinPhi * sinTheta;
              const u = 1 - (longNumber / longs);
              const v = latNumber / lats;
              normalData.push(x);
              normalData.push(y);
              normalData.push(z);
              texCoordData.push(u);
              texCoordData.push(v);
              geometryData.push(radius * x);
              geometryData.push(radius * y);
              geometryData.push(radius * z);
            }
          }
          for (let latNumber = 0; latNumber < lats; ++latNumber) {
            for (let longNumber = 0; longNumber < longs; ++longNumber) {
              const first = (latNumber * (longs + 1)) + longNumber;
              const second = first + longs + 1;
              indexData.push(first);
              indexData.push(second);
              indexData.push(first + 1);
              indexData.push(second);
              indexData.push(second + 1);
              indexData.push(first + 1);
            }
          }
          const retval = {};
          if (ctx === null) {
            retval.normalArray = normalData;
            retval.textureArray = texCoordData;
            retval.vertexArray = geometryData;
            retval.numIndices = indexData.length;
            retval.indexArray = indexData;
            retval.loaded = true;
          } else {
            retval.normalBuffer = ctx.createBuffer();
            ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.normalBuffer);
            ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(normalData), ctx.STATIC_DRAW);
            retval.texCoordObject = ctx.createBuffer();
            ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.texCoordObject);
            ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(texCoordData), ctx.STATIC_DRAW);
            retval.vertexBuffer = ctx.createBuffer();
            ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.vertexBuffer);
            ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(geometryData), ctx.STATIC_DRAW);
            retval.numIndices = indexData.length;
            retval.indexBuffer = ctx.createBuffer();
            ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, retval.indexBuffer);
            ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), ctx.STREAM_DRAW);
            retval.loaded = true;
          }
          return retval;
        };
        const loadObj = function (ctx, url, callback, errorCallback) {
          const obj = new J3DIObj();
          obj.gl = ctx;
          obj.url = url;
          const f = function (responseText, obj) {
            if (responseText == null) {
              module.log('.loadObj error no text for url:' + url);
              if (errorCallback) {
                errorCallback();
              }
            }
            doLoadObj(obj, responseText, callback, errorCallback);
          };
          loadFile(url, obj, f, errorCallback);
          return obj;
        };
        const doLoadObj = function (obj, text, callback, errorCallback) {
          module.log('.doLoadObj obj:' + obj + ' text:' + (text == null ? null : '"' + text.substring(0, Math.min(10, text.length)) + '..."') + ' callback:' + callback + ' errorCallback:' + errorCallback);
          if (text == null) {
            module.log('.doLoadObj error no text');
            if (errorCallback) {
              errorCallback();
            }
            return;
          }
          if (obj.gl != null) {
            checkGLError(obj.gl, 'easywebgl.doLoadObj... ' + obj.url);
          }
          const invertFaces = false;
          const vertexArray = [];
          const normalArray = [];
          const textureArray = [];
          const indexArray = [];
          const polyIndexArray = [];
          const vertex = [];
          const normal = [];
          const texture = [];
          const facemap = {};
          let index = 0;
          const tempIndexArray = new Array(4);
          const groups = {};
          let currentGroup = [0, 0];
          groups._unnamed = currentGroup;
          let recomputeNormals = false;
          const lines = text.split('\n');
          for (const lineIndex in lines) {
            const line = lines[lineIndex].replace(/[ \t]+/g, ' ').replace(/\s\s*$/, '');
            if (line[0] == '#') { continue; }
            const array = line.split(' ');
            if (array[0] == 'g') {
              currentGroup = [indexArray.length, 0];
              if (array[1] in groups) {
                array[1] += ' $' + lineIndex;
              }
              groups[array[1]] = currentGroup;
            } else if (array[0] == 'v') {
              vertex.push(parseFloat(array[1]));
              vertex.push(parseFloat(array[2]));
              vertex.push(-parseFloat(array[3]));
            } else if (array[0] == 'vt') {
              texture.push(parseFloat(array[1]));
              texture.push(parseFloat(array[2]));
            } else if (array[0] == 'vn') {
              normal.push(-parseFloat(array[1]));
              normal.push(-parseFloat(array[2]));
              normal.push(parseFloat(array[3]));
            } else if (array[0] == 'f') {
              if (array.length < 4) {
                module.error("face '" + line + "' not handled in " + obj.url);
                continue;
              }
              for (let i = 1; i < array.length; i++) {
                if (!(array[i] in facemap)) {
                  const f = array[i].split('/');
                  let vtx, nor, tex;
                  if (f.length == 1) {
                    vtx = parseInt(f[0]) - 1;
                    nor = vtx;
                    tex = vtx;
                  } else if (f.length = 3) {
                    vtx = parseInt(f[0]) - 1;
                    tex = parseInt(f[1]) - 1;
                    nor = parseInt(f[2]) - 1;
                  } else {
                    module.error("did not understand face '" + array[i] + "' in " + obj.url);
                    return null;
                  }
                  let x = 0;
                  let y = 0;
                  let z = 0;
                  if (vtx * 3 + 2 < vertex.length) {
                    x = vertex[vtx * 3];
                    y = vertex[vtx * 3 + 1];
                    z = vertex[vtx * 3 + 2];
                  }
                  vertexArray.push(x);
                  vertexArray.push(y);
                  vertexArray.push(z);
                  x = 0;
                  y = 0;
                  if (tex * 2 + 1 < texture.length) {
                    x = texture[tex * 2];
                    y = texture[tex * 2 + 1];
                  }
                  textureArray.push(x);
                  textureArray.push(1 - y);
                  x = 0;
                  y = 0;
                  z = 1;
                  if (nor * 3 + 2 < normal.length) {
                    x = normal[nor * 3];
                    y = normal[nor * 3 + 1];
                    z = normal[nor * 3 + 2];
                  } else {
                    recomputeNormals = true;
                  }
                  normalArray.push(x);
                  normalArray.push(y);
                  normalArray.push(z);
                  facemap[array[i]] = index++;
                }
                tempIndexArray[i - 1] = facemap[array[i]];
              }
              const poly = new Array(array.length - 1);
              for (let j = 0; j < array.length - 1; j++) {
                poly[j] = tempIndexArray[j];
              }
              polyIndexArray.push(poly);
              for (let j = 2; j < array.length - 1; j++) {
                indexArray.push(tempIndexArray[0]);
                indexArray.push(tempIndexArray[j - 1]);
                indexArray.push(tempIndexArray[j]);
                currentGroup[1] += 3;
              }
            }
          }
          if (recomputeNormals) {
            module.log('recomputing normals for ' + obj.url);
            for (let i = 0; i < normalArray.length; i++) {
              normalArray[i] = 0;
            }
            const x0 = new J3DIVector3();
            const x1 = new J3DIVector3();
            const x2 = new J3DIVector3();
            const x0tox1 = new J3DIVector3();
            const x0tox2 = new J3DIVector3();
            const x1tox2 = new J3DIVector3();
            const x1tox0 = new J3DIVector3();
            const n = new J3DIVector3();
            for (let i = 0; i < indexArray.length; i += 3) {
              x0.load(vertexArray[indexArray[i] * 3],
                vertexArray[indexArray[i] * 3 + 1],
                vertexArray[indexArray[i] * 3 + 2]);
              x1.load(vertexArray[indexArray[i + 1] * 3],
                vertexArray[indexArray[i + 1] * 3 + 1],
                vertexArray[indexArray[i + 1] * 3 + 2]);
              x2.load(vertexArray[indexArray[i + 2] * 3],
                vertexArray[indexArray[i + 2] * 3 + 1],
                vertexArray[indexArray[i + 2] * 3 + 2]);
              x0tox1.load(x1);
              x0tox1.subtract(x0);
              x0tox2.load(x2);
              x0tox2.subtract(x0);
              x1tox0.load(x0);
              x1tox0.subtract(x1);
              x1tox2.load(x2);
              x1tox2.subtract(x1);
              n.load(x0tox1);
              n.cross(x0tox2);
              n.multiply(0.5);
              x0tox1.normalize();
              x0tox2.normalize();
              const a0 = Math.acos(Math.abs(x0tox1.dot(x0tox2)));
              x1tox0.normalize();
              x1tox2.normalize();
              const a1 = Math.acos(Math.abs(x1tox2.dot(x1tox0)));
              const a2 = Math.PI - a1 - a0;
              normalArray[indexArray[i] * 3] += n[0] * a0;
              normalArray[indexArray[i] * 3 + 1] += n[1] * a0;
              normalArray[indexArray[i] * 3 + 2] += n[2] * a0;
              normalArray[indexArray[i + 1] * 3] += n[0] * a1;
              normalArray[indexArray[i + 1] * 3 + 1] += n[1] * a1;
              normalArray[indexArray[i + 1] * 3 + 2] += n[2] * a1;
              normalArray[indexArray[i + 2] * 3] += n[0] * a2;
              normalArray[indexArray[i + 2] * 3 + 1] += n[1] * a2;
              normalArray[indexArray[i + 2] * 3 + 2] += n[2] * a2;
            }
            for (let i = 0; i < normalArray.length; i += 3) {
              const len = Math.sqrt(
                normalArray[i] * normalArray[i] +
                  normalArray[i + 1] * normalArray[i + 1] +
                  normalArray[i + 2] * normalArray[i + 2]
              );
              normalArray[i] /= len;
              normalArray[i + 1] /= len;
              normalArray[i + 2] /= len;
            }
          }
          obj.normalArray = normalArray;
          obj.textureArray = textureArray;
          obj.vertexArray = vertexArray;
          obj.numIndices = indexArray.length;
          obj.indexArray = indexArray;
          obj.polyIndexArray = polyIndexArray;
          obj.groups = groups;
          obj.loaded = true;
          obj.updateGL();
          if (callback) {
            callback(obj);
          }
        };
        const loadImageTexture = function (ctx, url, callback, errorCallback) {
          if (ctx == null) {
            const texture = {};
            texture.image = new Image();
            texture.image.onload = function () {
              if (callback) { callback(texture); }
            };
            texture.image.src = url;
            return texture;
          } else {
            const texture = ctx.createTexture();
            texture.image = new Image();
            texture.image.onload = function () {
              doLoadImageTexture(ctx, texture.image, texture, callback, errorCallback);
            };
            texture.image.src = url;
            return texture;
          }
        };
        const doLoadImageTexture = function (ctx, image, texture, callback, errorCallback) {
          ctx.bindTexture(ctx.TEXTURE_2D, texture);
          ctx.texImage2D(
            ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, image);
          ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
          ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR_MIPMAP_LINEAR);
          ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.REPEAT);
          ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.REPEAT);
          ctx.generateMipmap(ctx.TEXTURE_2D);
          ctx.bindTexture(ctx.TEXTURE_2D, null);
          if (callback) { callback(texture); }
        };
        const makeFailHTML = function (msg) {
          return '' +
              '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
              '<td align="center">' +
              '<div style="display: table-cell; vertical-align: middle;">' +
              '<div style="">' + msg + '</div>' +
              '</div>' +
              '</td></tr></table>';
        };
        const GET_A_WEBGL_BROWSER_MSG = 'This page requires a browser that supports WebGL.';
        const GET_A_WEBGL_BROWSER = '' +
            GET_A_WEBGL_BROWSER_MSG + '<br/>' +
            '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';
        const OTHER_PROBLEM_MSG = "It doesn't appear your computer can support WebGL.";
        const OTHER_PROBLEM = '' + OTHER_PROBLEM_MSG + '<br/>' +
            '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';
        const setupWebGL = function (canvas, opt_attribs, showLinkOnError) {
          function showLink(str) {
            const container = canvas.parentNode;
            if (container) {
              container.innerHTML = makeFailHTML(str);
            }
          }

          if (!window.WebGLRenderingContext) {
            if (showLinkOnError) {
              showLink(GET_A_WEBGL_BROWSER);
            }
            return GET_A_WEBGL_BROWSER_MSG;
          }
          const context = create3DContext(canvas, opt_attribs);
          if (!context) {
            if (showLinkOnError) {
              showLink(OTHER_PROBLEM);
            }
            return OTHER_PROBLEM_MSG;
          }
          return context;
        };
        const create3DContext = function (canvas, opt_attribs) {
          const names = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
          let context = null;
          for (let ii = 0; ii < names.length; ++ii) {
            try {
              context = canvas.getContext(names[ii], opt_attribs);
            } catch (e) {
            }
            if (context) {
              break;
            }
          }
          return context;
        };
        return {
          J3DIObj: J3DIObj,
          newJ3DIObj: function () {
            return new J3DIObj();
          },
          initWebGL: initWebGL,
          checkGLError: checkGLError,
          loadShader: loadShader,
          loadFile: loadFile,
          loadXML: loadXML,
          loadFiles: loadFiles,
          makeBox: makeBox,
          makeSphere: makeSphere,
          loadObj: loadObj,
          loadImageTexture: loadImageTexture,
          create3DContext: create3DContext,
          setupWebGL: setupWebGL,
          setFileData: setFileData,
          requestAnimFrame: requestAnimFrame
        };
      });
    'use strict';
    function formatNumber(number, digits) {
      if (digits === undefined) {
        digits = 2;
      }
      const a = number.toString().split('e');
      let str = +(+a[0]).toFixed(digits);
      if (a.length > 1) {
        str += 'e' + a[1];
      }
      return str;
    }
    /*
      J3DIMatrix4 class
      This class implements a 4x4 matrix. It has functions which duplicate the
      functionality of the OpenGL matrix stack and glut functions. On browsers
      that support it, CSSMatrix is used to accelerate operations.
      IDL:
      [
          Constructor(in J3DIMatrix4 matrix),
          Constructor(in sequence<float> array)
          Constructor()
      ]
      interface J3DIMatrix4 {
          void load(in J3DIMatrix4 matrix);
          void load(in sequence<float> array);
          sequence<float> getAsArray();
          Float32Array getAsFloat32Array();
          void setUniform(in WebGLRenderingContext ctx,
                          in WebGLUniformLocation loc,
                          in boolean transpose);
          void makeIdentity();
          void transpose();
          void invert();
          void translate(in float x, in float y, in float z);
          void translate(in J3DVector3 v);
          void scale(in float x, in float y, in float z);
          void scale(in J3DVector3 v);
          void rotate(in float angle,
                      in float x, in float y, in float z);
          void rotate(in float angle, in J3DVector3 v);
          void multiply(in J3DIMatrix4 matrix);
          void premultiply(in J3DIMatrix4 matrix);
          void multiply(float factor);
          void divide(in float divisor);
          void ortho(in float left, in float right,
                    in float bottom, in float top,
                    in float near, in float far);
          void frustum(in float left, in float right,
                      in float bottom, in float top,
                      in float near, in float far);
          void perspective(in float fovy, in float aspect,
                          in float zNear, in float zFar);
          void lookat(in J3DVector3 eye,
                      in J3DVector3 center,
                      in J3DVector3 up);
          bool decompose(in J3DVector3 translate,
                          in J3DVector3 rotate,
                          in J3DVector3 scale,
                          in J3DVector3 skew,
                          in sequence<float> perspective);
          J3DIVector3 loghat();
          float trace();
      }
      [
          Constructor(in J3DVector3 vector),
          Constructor(in sequence<float> array)
          Constructor(in float x, in float y, in float z)
          Constructor()
      ]
      interface J3DIVector3 {
          void load(in J3DVector3 vector);
          void load(in sequence<float> array);
          void load(in float x, in float y, in float z);
          sequence<float> getAsArray();
          Float32Array getAsFloat32Array();
          void multVecMatrix(in J3DIMatrix4 matrix);
          void multNormalMatrix(in J3DIMatrix4 matrix);
          float vectorLength();
          float dot();
          void cross(in J3DVector3 v);
          void divide(in float/J3DVector divisor);
          J3DVector3 subtract(in J3DVector3 v);
          J3DVector3 multiply(in J3DVector3 v);
          J3DVector3 normalize();
          J3DVector3 reflect(in J3DVector3 v);
          float norm();
          J3DIMatrix4 exphat();
          J3DIMatrix4 hat();
      }
      [
          Constructor(in J3DVector3 vector),
          Constructor(in sequence<float> array)
          Constructor()
      ]
      interface J3DIVertexArray {
          void load(in array vector);
          void multVecMatrix(in J3DIMatrix4 matrix);
          J3DVector3 rawNormal(in int i1, in int i2, in int i3);
          J3DVector3 rawZ(in int i1, in int i2, in int i3);
          J3DVector3 normal(in int i1, in int i2, in int i3);
      }
      static {
          elerp(in J3DIMatrix4 R1,
                        in J3DIMatrix4 R2,
                        in float lambda)
          rigidLerp(in J3DIMatrix4 T1,
                        in J3DIMatrix4 T2,
                        in float lambda)
          clamp(in value, in min, in max)
      }
  */
    let J3DIHasCSSMatrix = false;
    let J3DIHasCSSMatrixCopy = false;
    if ('WebKitCSSMatrix' in window && ('media' in window && window.media.matchMedium('(-webkit-transform-3d)')) ||
                                    ('styleMedia' in window && window.styleMedia.matchMedium('(-webkit-transform-3d)'))) {
      J3DIHasCSSMatrix = true;
      if ('copy' in WebKitCSSMatrix.prototype) { J3DIHasCSSMatrixCopy = true; }
    }
    class J3DIMatrix4 {
      constructor(m) {
        if (J3DIHasCSSMatrix) { this.$matrix = new WebKitCSSMatrix(); } else { this.$matrix = new Object(); }
        if (typeof m === 'object') {
          if ('length' in m && m.length >= 16) {
            this.load(m);
            return;
          } else if (m instanceof J3DIMatrix4) {
            this.load(m);
            return;
          }
        }
        this.makeIdentity();
      }
    }
    J3DIMatrix4.prototype.load = function () {
      if (arguments.length == 1 && typeof arguments[0] === 'object') {
        let matrix;
        if (arguments[0] instanceof J3DIMatrix4) {
          matrix = arguments[0].$matrix;
          this.$matrix.m11 = matrix.m11;
          this.$matrix.m12 = matrix.m12;
          this.$matrix.m13 = matrix.m13;
          this.$matrix.m14 = matrix.m14;
          this.$matrix.m21 = matrix.m21;
          this.$matrix.m22 = matrix.m22;
          this.$matrix.m23 = matrix.m23;
          this.$matrix.m24 = matrix.m24;
          this.$matrix.m31 = matrix.m31;
          this.$matrix.m32 = matrix.m32;
          this.$matrix.m33 = matrix.m33;
          this.$matrix.m34 = matrix.m34;
          this.$matrix.m41 = matrix.m41;
          this.$matrix.m42 = matrix.m42;
          this.$matrix.m43 = matrix.m43;
          this.$matrix.m44 = matrix.m44;
          return;
        } else { matrix = arguments[0]; }
        if ('length' in matrix && matrix.length >= 16) {
          this.$matrix.m11 = matrix[0];
          this.$matrix.m12 = matrix[1];
          this.$matrix.m13 = matrix[2];
          this.$matrix.m14 = matrix[3];
          this.$matrix.m21 = matrix[4];
          this.$matrix.m22 = matrix[5];
          this.$matrix.m23 = matrix[6];
          this.$matrix.m24 = matrix[7];
          this.$matrix.m31 = matrix[8];
          this.$matrix.m32 = matrix[9];
          this.$matrix.m33 = matrix[10];
          this.$matrix.m34 = matrix[11];
          this.$matrix.m41 = matrix[12];
          this.$matrix.m42 = matrix[13];
          this.$matrix.m43 = matrix[14];
          this.$matrix.m44 = matrix[15];
          return;
        }
      }
      this.makeIdentity();
      return this;
    };
    J3DIMatrix4.prototype.getAsArray = function () {
      return [
        this.$matrix.m11, this.$matrix.m12, this.$matrix.m13, this.$matrix.m14,
        this.$matrix.m21, this.$matrix.m22, this.$matrix.m23, this.$matrix.m24,
        this.$matrix.m31, this.$matrix.m32, this.$matrix.m33, this.$matrix.m34,
        this.$matrix.m41, this.$matrix.m42, this.$matrix.m43, this.$matrix.m44
      ];
    };
    J3DIMatrix4.prototype.toString = function () {
      const m = this.$matrix;
      return '[' + m.m11 + ' ' + m.m12 + ' ' + m.m13 + ' ' + m.m14 + ';' +
                m.m21 + ' ' + m.m22 + ' ' + m.m23 + ' ' + m.m24 + ';' +
                m.m31 + ' ' + m.m32 + ' ' + m.m33 + ' ' + m.m34 + ';' +
                m.m41 + ' ' + m.m42 + ' ' + m.m43 + ' ' + m.m44 + ';' +
              ']';
    };
    J3DIMatrix4.prototype.getAsFloat32Array = function () {
      if (J3DIHasCSSMatrixCopy) {
        const array = new Float32Array(16);
        this.$matrix.copy(array);
        return array;
      }
      return new Float32Array(this.getAsArray());
    };
    J3DIMatrix4.prototype.setUniform = function (ctx, loc, transpose) {
      if (J3DIMatrix4.setUniformArray == undefined) {
        J3DIMatrix4.setUniformWebGLArray = new Float32Array(16);
        J3DIMatrix4.setUniformArray = new Array(16);
      }
      if (J3DIHasCSSMatrixCopy) { this.$matrix.copy(J3DIMatrix4.setUniformWebGLArray); } else {
        J3DIMatrix4.setUniformArray[0] = this.$matrix.m11;
        J3DIMatrix4.setUniformArray[1] = this.$matrix.m12;
        J3DIMatrix4.setUniformArray[2] = this.$matrix.m13;
        J3DIMatrix4.setUniformArray[3] = this.$matrix.m14;
        J3DIMatrix4.setUniformArray[4] = this.$matrix.m21;
        J3DIMatrix4.setUniformArray[5] = this.$matrix.m22;
        J3DIMatrix4.setUniformArray[6] = this.$matrix.m23;
        J3DIMatrix4.setUniformArray[7] = this.$matrix.m24;
        J3DIMatrix4.setUniformArray[8] = this.$matrix.m31;
        J3DIMatrix4.setUniformArray[9] = this.$matrix.m32;
        J3DIMatrix4.setUniformArray[10] = this.$matrix.m33;
        J3DIMatrix4.setUniformArray[11] = this.$matrix.m34;
        J3DIMatrix4.setUniformArray[12] = this.$matrix.m41;
        J3DIMatrix4.setUniformArray[13] = this.$matrix.m42;
        J3DIMatrix4.setUniformArray[14] = this.$matrix.m43;
        J3DIMatrix4.setUniformArray[15] = this.$matrix.m44;
        J3DIMatrix4.setUniformWebGLArray.set(J3DIMatrix4.setUniformArray);
      }
      ctx.uniformMatrix4fv(loc, transpose, J3DIMatrix4.setUniformWebGLArray);
    };
    J3DIMatrix4.prototype.makeIdentity = function () {
      this.$matrix.m11 = 1;
      this.$matrix.m12 = 0;
      this.$matrix.m13 = 0;
      this.$matrix.m14 = 0;
      this.$matrix.m21 = 0;
      this.$matrix.m22 = 1;
      this.$matrix.m23 = 0;
      this.$matrix.m24 = 0;
      this.$matrix.m31 = 0;
      this.$matrix.m32 = 0;
      this.$matrix.m33 = 1;
      this.$matrix.m34 = 0;
      this.$matrix.m41 = 0;
      this.$matrix.m42 = 0;
      this.$matrix.m43 = 0;
      this.$matrix.m44 = 1;
    };
    J3DIMatrix4.prototype.transpose = function () {
      let tmp = this.$matrix.m12;
      this.$matrix.m12 = this.$matrix.m21;
      this.$matrix.m21 = tmp;
      tmp = this.$matrix.m13;
      this.$matrix.m13 = this.$matrix.m31;
      this.$matrix.m31 = tmp;
      tmp = this.$matrix.m14;
      this.$matrix.m14 = this.$matrix.m41;
      this.$matrix.m41 = tmp;
      tmp = this.$matrix.m23;
      this.$matrix.m23 = this.$matrix.m32;
      this.$matrix.m32 = tmp;
      tmp = this.$matrix.m24;
      this.$matrix.m24 = this.$matrix.m42;
      this.$matrix.m42 = tmp;
      tmp = this.$matrix.m34;
      this.$matrix.m34 = this.$matrix.m43;
      this.$matrix.m43 = tmp;
      return this;
    };
    J3DIMatrix4.prototype.invert = function () {
      if (J3DIHasCSSMatrix) {
        this.$matrix = this.$matrix.inverse();
        return;
      }
      const det = this._determinant4x4();
      if (Math.abs(det) < 1e-8) { return null; }
      this._makeAdjoint();
      this.$matrix.m11 /= det;
      this.$matrix.m12 /= det;
      this.$matrix.m13 /= det;
      this.$matrix.m14 /= det;
      this.$matrix.m21 /= det;
      this.$matrix.m22 /= det;
      this.$matrix.m23 /= det;
      this.$matrix.m24 /= det;
      this.$matrix.m31 /= det;
      this.$matrix.m32 /= det;
      this.$matrix.m33 /= det;
      this.$matrix.m34 /= det;
      this.$matrix.m41 /= det;
      this.$matrix.m42 /= det;
      this.$matrix.m43 /= det;
      this.$matrix.m44 /= det;
    };
    J3DIMatrix4.prototype.translate = function (x, y, z) {
      if (typeof x === 'object' && ('length' in x || 'vectorLength' in x)) {
        const t = x;
        x = t[0];
        y = t[1];
        z = t[2];
      } else {
        if (x == undefined) { x = 0; }
        if (y == undefined) { y = 0; }
        if (z == undefined) { z = 0; }
      }
      if (J3DIHasCSSMatrix) {
        this.$matrix = this.$matrix.translate(x, y, z);
        return;
      }
      const matrix = new J3DIMatrix4();
      matrix.$matrix.m41 = x;
      matrix.$matrix.m42 = y;
      matrix.$matrix.m43 = z;
      this.multiply(matrix);
      return this;
    };
    J3DIMatrix4.prototype.scale = function (x, y, z) {
      if (typeof x === 'object' && 'length' in x) {
        const t = x;
        x = t[0];
        y = t[1];
        z = t[2];
      } else {
        if (x == undefined) { x = 1; }
        if (z == undefined) {
          if (y == undefined) {
            y = x;
            z = x;
          } else { z = 1; }
        } else if (y == undefined) { y = x; }
      }
      if (J3DIHasCSSMatrix) {
        this.$matrix = this.$matrix.scale(x, y, z);
        return this;
      }
      const matrix = new J3DIMatrix4();
      matrix.$matrix.m11 = x;
      matrix.$matrix.m22 = y;
      matrix.$matrix.m33 = z;
      this.multiply(matrix);
      return this;
    };
    J3DIMatrix4.prototype.rotate = function (angle, x, y, z) {
      if (typeof x === 'object' && 'length' in x) {
        const t = x;
        x = t[0];
        y = t[1];
        z = t[2];
      } else {
        if (arguments.length == 1) {
          x = 0;
          y = 0;
          z = 1;
        } else if (arguments.length == 3) {
          this.rotate(angle, 1, 0, 0);
          this.rotate(x, 0, 1, 0);
          this.rotate(y, 0, 0, 1);
          return;
        }
      }
      if (J3DIHasCSSMatrix) {
        this.$matrix = this.$matrix.rotateAxisAngle(x, y, z, angle);
        return this;
      }
      angle = angle / 180 * Math.PI;
      angle /= 2;
      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);
      const sinA2 = sinA * sinA;
      const len = Math.sqrt(x * x + y * y + z * z);
      if (len == 0) {
        x = 0;
        y = 0;
        z = 1;
      } else if (len != 1) {
        x /= len;
        y /= len;
        z /= len;
      }
      const mat = new J3DIMatrix4();
      if (x == 1 && y == 0 && z == 0) {
        mat.$matrix.m11 = 1;
        mat.$matrix.m12 = 0;
        mat.$matrix.m13 = 0;
        mat.$matrix.m21 = 0;
        mat.$matrix.m22 = 1 - 2 * sinA2;
        mat.$matrix.m23 = 2 * sinA * cosA;
        mat.$matrix.m31 = 0;
        mat.$matrix.m32 = -2 * sinA * cosA;
        mat.$matrix.m33 = 1 - 2 * sinA2;
        mat.$matrix.m14 = mat.$matrix.m24 = mat.$matrix.m34 = 0;
        mat.$matrix.m41 = mat.$matrix.m42 = mat.$matrix.m43 = 0;
        mat.$matrix.m44 = 1;
      } else if (x == 0 && y == 1 && z == 0) {
        mat.$matrix.m11 = 1 - 2 * sinA2;
        mat.$matrix.m12 = 0;
        mat.$matrix.m13 = -2 * sinA * cosA;
        mat.$matrix.m21 = 0;
        mat.$matrix.m22 = 1;
        mat.$matrix.m23 = 0;
        mat.$matrix.m31 = 2 * sinA * cosA;
        mat.$matrix.m32 = 0;
        mat.$matrix.m33 = 1 - 2 * sinA2;
        mat.$matrix.m14 = mat.$matrix.m24 = mat.$matrix.m34 = 0;
        mat.$matrix.m41 = mat.$matrix.m42 = mat.$matrix.m43 = 0;
        mat.$matrix.m44 = 1;
      } else if (x == 0 && y == 0 && z == 1) {
        mat.$matrix.m11 = 1 - 2 * sinA2;
        mat.$matrix.m12 = 2 * sinA * cosA;
        mat.$matrix.m13 = 0;
        mat.$matrix.m21 = -2 * sinA * cosA;
        mat.$matrix.m22 = 1 - 2 * sinA2;
        mat.$matrix.m23 = 0;
        mat.$matrix.m31 = 0;
        mat.$matrix.m32 = 0;
        mat.$matrix.m33 = 1;
        mat.$matrix.m14 = mat.$matrix.m24 = mat.$matrix.m34 = 0;
        mat.$matrix.m41 = mat.$matrix.m42 = mat.$matrix.m43 = 0;
        mat.$matrix.m44 = 1;
      } else {
        const x2 = x * x;
        const y2 = y * y;
        const z2 = z * z;
        mat.$matrix.m11 = 1 - 2 * (y2 + z2) * sinA2;
        mat.$matrix.m12 = 2 * (x * y * sinA2 + z * sinA * cosA);
        mat.$matrix.m13 = 2 * (x * z * sinA2 - y * sinA * cosA);
        mat.$matrix.m21 = 2 * (y * x * sinA2 - z * sinA * cosA);
        mat.$matrix.m22 = 1 - 2 * (z2 + x2) * sinA2;
        mat.$matrix.m23 = 2 * (y * z * sinA2 + x * sinA * cosA);
        mat.$matrix.m31 = 2 * (z * x * sinA2 + y * sinA * cosA);
        mat.$matrix.m32 = 2 * (z * y * sinA2 - x * sinA * cosA);
        mat.$matrix.m33 = 1 - 2 * (x2 + y2) * sinA2;
        mat.$matrix.m14 = mat.$matrix.m24 = mat.$matrix.m34 = 0;
        mat.$matrix.m41 = mat.$matrix.m42 = mat.$matrix.m43 = 0;
        mat.$matrix.m44 = 1;
      }
      this.multiply(mat);
      return this;
    };
    J3DIMatrix4.prototype.multiply = function (mat) {
      if (typeof mat === 'object' && '$matrix' in mat) {
        if (J3DIHasCSSMatrix) {
          this.$matrix = this.$matrix.multiply(mat.$matrix);
          return this;
        }
        const m11 = (mat.$matrix.m11 * this.$matrix.m11 + mat.$matrix.m12 * this.$matrix.m21 +
                  mat.$matrix.m13 * this.$matrix.m31 + mat.$matrix.m14 * this.$matrix.m41);
        const m12 = (mat.$matrix.m11 * this.$matrix.m12 + mat.$matrix.m12 * this.$matrix.m22 +
                  mat.$matrix.m13 * this.$matrix.m32 + mat.$matrix.m14 * this.$matrix.m42);
        const m13 = (mat.$matrix.m11 * this.$matrix.m13 + mat.$matrix.m12 * this.$matrix.m23 +
                  mat.$matrix.m13 * this.$matrix.m33 + mat.$matrix.m14 * this.$matrix.m43);
        const m14 = (mat.$matrix.m11 * this.$matrix.m14 + mat.$matrix.m12 * this.$matrix.m24 +
                  mat.$matrix.m13 * this.$matrix.m34 + mat.$matrix.m14 * this.$matrix.m44);
        const m21 = (mat.$matrix.m21 * this.$matrix.m11 + mat.$matrix.m22 * this.$matrix.m21 +
                  mat.$matrix.m23 * this.$matrix.m31 + mat.$matrix.m24 * this.$matrix.m41);
        const m22 = (mat.$matrix.m21 * this.$matrix.m12 + mat.$matrix.m22 * this.$matrix.m22 +
                  mat.$matrix.m23 * this.$matrix.m32 + mat.$matrix.m24 * this.$matrix.m42);
        const m23 = (mat.$matrix.m21 * this.$matrix.m13 + mat.$matrix.m22 * this.$matrix.m23 +
                  mat.$matrix.m23 * this.$matrix.m33 + mat.$matrix.m24 * this.$matrix.m43);
        const m24 = (mat.$matrix.m21 * this.$matrix.m14 + mat.$matrix.m22 * this.$matrix.m24 +
                  mat.$matrix.m23 * this.$matrix.m34 + mat.$matrix.m24 * this.$matrix.m44);
        const m31 = (mat.$matrix.m31 * this.$matrix.m11 + mat.$matrix.m32 * this.$matrix.m21 +
                  mat.$matrix.m33 * this.$matrix.m31 + mat.$matrix.m34 * this.$matrix.m41);
        const m32 = (mat.$matrix.m31 * this.$matrix.m12 + mat.$matrix.m32 * this.$matrix.m22 +
                  mat.$matrix.m33 * this.$matrix.m32 + mat.$matrix.m34 * this.$matrix.m42);
        const m33 = (mat.$matrix.m31 * this.$matrix.m13 + mat.$matrix.m32 * this.$matrix.m23 +
                  mat.$matrix.m33 * this.$matrix.m33 + mat.$matrix.m34 * this.$matrix.m43);
        const m34 = (mat.$matrix.m31 * this.$matrix.m14 + mat.$matrix.m32 * this.$matrix.m24 +
                  mat.$matrix.m33 * this.$matrix.m34 + mat.$matrix.m34 * this.$matrix.m44);
        const m41 = (mat.$matrix.m41 * this.$matrix.m11 + mat.$matrix.m42 * this.$matrix.m21 +
                  mat.$matrix.m43 * this.$matrix.m31 + mat.$matrix.m44 * this.$matrix.m41);
        const m42 = (mat.$matrix.m41 * this.$matrix.m12 + mat.$matrix.m42 * this.$matrix.m22 +
                  mat.$matrix.m43 * this.$matrix.m32 + mat.$matrix.m44 * this.$matrix.m42);
        const m43 = (mat.$matrix.m41 * this.$matrix.m13 + mat.$matrix.m42 * this.$matrix.m23 +
                  mat.$matrix.m43 * this.$matrix.m33 + mat.$matrix.m44 * this.$matrix.m43);
        const m44 = (mat.$matrix.m41 * this.$matrix.m14 + mat.$matrix.m42 * this.$matrix.m24 +
                  mat.$matrix.m43 * this.$matrix.m34 + mat.$matrix.m44 * this.$matrix.m44);
        this.$matrix.m11 = m11;
        this.$matrix.m12 = m12;
        this.$matrix.m13 = m13;
        this.$matrix.m14 = m14;
        this.$matrix.m21 = m21;
        this.$matrix.m22 = m22;
        this.$matrix.m23 = m23;
        this.$matrix.m24 = m24;
        this.$matrix.m31 = m31;
        this.$matrix.m32 = m32;
        this.$matrix.m33 = m33;
        this.$matrix.m34 = m34;
        this.$matrix.m41 = m41;
        this.$matrix.m42 = m42;
        this.$matrix.m43 = m43;
        this.$matrix.m44 = m44;
      } else {
        this.$matrix.m11 *= mat;
        this.$matrix.m12 *= mat;
        this.$matrix.m13 *= mat;
        this.$matrix.m14 *= mat;
        this.$matrix.m21 *= mat;
        this.$matrix.m22 *= mat;
        this.$matrix.m23 *= mat;
        this.$matrix.m24 *= mat;
        this.$matrix.m31 *= mat;
        this.$matrix.m32 *= mat;
        this.$matrix.m33 *= mat;
        this.$matrix.m34 *= mat;
        this.$matrix.m41 *= mat;
        this.$matrix.m42 *= mat;
        this.$matrix.m43 *= mat;
        this.$matrix.m44 *= mat;
      }
      return this;
    };
    J3DIMatrix4.prototype.premultiply = function (mat) {
      if (typeof mx2 === 'object' && '$matrix' in mat) {
        if (J3DIHasCSSMatrix) {
          this.$matrix = mat.$matrix.multiply(this.$matrix);
          return mx1;
        }
        const mx1 = mat;
        const mx2 = this;
        const m11 = (mx2.$matrix.m11 * mx1.$matrix.m11 + mx2.$matrix.m12 * mx1.$matrix.m21 +
                  mx2.$matrix.m13 * mx1.$matrix.m31 + mx2.$matrix.m14 * mx1.$matrix.m41);
        const m12 = (mx2.$matrix.m11 * mx1.$matrix.m12 + mx2.$matrix.m12 * mx1.$matrix.m22 +
                  mx2.$matrix.m13 * mx1.$matrix.m32 + mx2.$matrix.m14 * mx1.$matrix.m42);
        const m13 = (mx2.$matrix.m11 * mx1.$matrix.m13 + mx2.$matrix.m12 * mx1.$matrix.m23 +
                  mx2.$matrix.m13 * mx1.$matrix.m33 + mx2.$matrix.m14 * mx1.$matrix.m43);
        const m14 = (mx2.$matrix.m11 * mx1.$matrix.m14 + mx2.$matrix.m12 * mx1.$matrix.m24 +
                  mx2.$matrix.m13 * mx1.$matrix.m34 + mx2.$matrix.m14 * mx1.$matrix.m44);
        const m21 = (mx2.$matrix.m21 * mx1.$matrix.m11 + mx2.$matrix.m22 * mx1.$matrix.m21 +
                  mx2.$matrix.m23 * mx1.$matrix.m31 + mx2.$matrix.m24 * mx1.$matrix.m41);
        const m22 = (mx2.$matrix.m21 * mx1.$matrix.m12 + mx2.$matrix.m22 * mx1.$matrix.m22 +
                  mx2.$matrix.m23 * mx1.$matrix.m32 + mx2.$matrix.m24 * mx1.$matrix.m42);
        const m23 = (mx2.$matrix.m21 * mx1.$matrix.m13 + mx2.$matrix.m22 * mx1.$matrix.m23 +
                  mx2.$matrix.m23 * mx1.$matrix.m33 + mx2.$matrix.m24 * mx1.$matrix.m43);
        const m24 = (mx2.$matrix.m21 * mx1.$matrix.m14 + mx2.$matrix.m22 * mx1.$matrix.m24 +
                  mx2.$matrix.m23 * mx1.$matrix.m34 + mx2.$matrix.m24 * mx1.$matrix.m44);
        const m31 = (mx2.$matrix.m31 * mx1.$matrix.m11 + mx2.$matrix.m32 * mx1.$matrix.m21 +
                  mx2.$matrix.m33 * mx1.$matrix.m31 + mx2.$matrix.m34 * mx1.$matrix.m41);
        const m32 = (mx2.$matrix.m31 * mx1.$matrix.m12 + mx2.$matrix.m32 * mx1.$matrix.m22 +
                  mx2.$matrix.m33 * mx1.$matrix.m32 + mx2.$matrix.m34 * mx1.$matrix.m42);
        const m33 = (mx2.$matrix.m31 * mx1.$matrix.m13 + mx2.$matrix.m32 * mx1.$matrix.m23 +
                  mx2.$matrix.m33 * mx1.$matrix.m33 + mx2.$matrix.m34 * mx1.$matrix.m43);
        const m34 = (mx2.$matrix.m31 * mx1.$matrix.m14 + mx2.$matrix.m32 * mx1.$matrix.m24 +
                  mx2.$matrix.m33 * mx1.$matrix.m34 + mx2.$matrix.m34 * mx1.$matrix.m44);
        const m41 = (mx2.$matrix.m41 * mx1.$matrix.m11 + mx2.$matrix.m42 * mx1.$matrix.m21 +
                  mx2.$matrix.m43 * mx1.$matrix.m31 + mx2.$matrix.m44 * mx1.$matrix.m41);
        const m42 = (mx2.$matrix.m41 * mx1.$matrix.m12 + mx2.$matrix.m42 * mx1.$matrix.m22 +
                  mx2.$matrix.m43 * mx1.$matrix.m32 + mx2.$matrix.m44 * mx1.$matrix.m42);
        const m43 = (mx2.$matrix.m41 * mx1.$matrix.m13 + mx2.$matrix.m42 * mx1.$matrix.m23 +
                  mx2.$matrix.m43 * mx1.$matrix.m33 + mx2.$matrix.m44 * mx1.$matrix.m43);
        const m44 = (mx2.$matrix.m41 * mx1.$matrix.m14 + mx2.$matrix.m42 * mx1.$matrix.m24 +
                  mx2.$matrix.m43 * mx1.$matrix.m34 + mx2.$matrix.m44 * mx1.$matrix.m44);
        this.$matrix.m11 = m11;
        this.$matrix.m12 = m12;
        this.$matrix.m13 = m13;
        this.$matrix.m14 = m14;
        this.$matrix.m21 = m21;
        this.$matrix.m22 = m22;
        this.$matrix.m23 = m23;
        this.$matrix.m24 = m24;
        this.$matrix.m31 = m31;
        this.$matrix.m32 = m32;
        this.$matrix.m33 = m33;
        this.$matrix.m34 = m34;
        this.$matrix.m41 = m41;
        this.$matrix.m42 = m42;
        this.$matrix.m43 = m43;
        this.$matrix.m44 = m44;
      } else {
        this.$matrix.m11 *= mat;
        this.$matrix.m12 *= mat;
        this.$matrix.m13 *= mat;
        this.$matrix.m14 *= mat;
        this.$matrix.m21 *= mat;
        this.$matrix.m22 *= mat;
        this.$matrix.m23 *= mat;
        this.$matrix.m24 *= mat;
        this.$matrix.m31 *= mat;
        this.$matrix.m32 *= mat;
        this.$matrix.m33 *= mat;
        this.$matrix.m34 *= mat;
        this.$matrix.m41 *= mat;
        this.$matrix.m42 *= mat;
        this.$matrix.m43 *= mat;
        this.$matrix.m44 *= mat;
      }
      return this;
    };
    J3DIMatrix4.prototype.divide = function (divisor) {
      this.$matrix.m11 /= divisor;
      this.$matrix.m12 /= divisor;
      this.$matrix.m13 /= divisor;
      this.$matrix.m14 /= divisor;
      this.$matrix.m21 /= divisor;
      this.$matrix.m22 /= divisor;
      this.$matrix.m23 /= divisor;
      this.$matrix.m24 /= divisor;
      this.$matrix.m31 /= divisor;
      this.$matrix.m32 /= divisor;
      this.$matrix.m33 /= divisor;
      this.$matrix.m34 /= divisor;
      this.$matrix.m41 /= divisor;
      this.$matrix.m42 /= divisor;
      this.$matrix.m43 /= divisor;
      this.$matrix.m44 /= divisor;
      return this;
    };
    J3DIMatrix4.prototype.ortho = function (left, right, bottom, top, near, far) {
      const tx = (left + right) / (left - right);
      const ty = (top + bottom) / (top - bottom);
      const tz = (far + near) / (far - near);
      const matrix = new J3DIMatrix4();
      matrix.$matrix.m11 = 2 / (left - right);
      matrix.$matrix.m12 = 0;
      matrix.$matrix.m13 = 0;
      matrix.$matrix.m14 = 0;
      matrix.$matrix.m21 = 0;
      matrix.$matrix.m22 = 2 / (top - bottom);
      matrix.$matrix.m23 = 0;
      matrix.$matrix.m24 = 0;
      matrix.$matrix.m31 = 0;
      matrix.$matrix.m32 = 0;
      matrix.$matrix.m33 = -2 / (far - near);
      matrix.$matrix.m34 = 0;
      matrix.$matrix.m41 = tx;
      matrix.$matrix.m42 = ty;
      matrix.$matrix.m43 = tz;
      matrix.$matrix.m44 = 1;
      this.multiply(matrix);
    };
    J3DIMatrix4.prototype.frustum = function (left, right, bottom, top, near, far) {
      const matrix = new J3DIMatrix4();
      const A = (right + left) / (right - left);
      const B = (top + bottom) / (top - bottom);
      const C = -(far + near) / (far - near);
      const D = -(2 * far * near) / (far - near);
      matrix.$matrix.m11 = (2 * near) / (right - left);
      matrix.$matrix.m12 = 0;
      matrix.$matrix.m13 = 0;
      matrix.$matrix.m14 = 0;
      matrix.$matrix.m21 = 0;
      matrix.$matrix.m22 = 2 * near / (top - bottom);
      matrix.$matrix.m23 = 0;
      matrix.$matrix.m24 = 0;
      matrix.$matrix.m31 = A;
      matrix.$matrix.m32 = B;
      matrix.$matrix.m33 = C;
      matrix.$matrix.m34 = -1;
      matrix.$matrix.m41 = 0;
      matrix.$matrix.m42 = 0;
      matrix.$matrix.m43 = D;
      matrix.$matrix.m44 = 0;
      this.multiply(matrix);
    };
    J3DIMatrix4.prototype.perspective = function (fovy, aspect, zNear, zFar) {
      const top = Math.tan(fovy * Math.PI / 360) * zNear;
      const bottom = -top;
      const left = aspect * bottom;
      const right = aspect * top;
      this.frustum(left, right, bottom, top, zNear, zFar);
    };
    J3DIMatrix4.prototype.world = function (posx, posy, posz, forwardx, forwardy, forwardz, upx, upy, upz) {
      if (typeof posx === 'object' && 'length' in posx) {
        let t = eyez;
        upx = t[0];
        upy = t[1];
        upz = t[2];
        t = eyey;
        dirx = t[0];
        diry = t[1];
        dirz = t[2];
        t = eyex;
        posx = t[0];
        posy = t[1];
        posz = t[2];
      }
      const matrix = new J3DIMatrix4();
      const forward = new J3DIVector3(forwardx, forwardy, forwardz);
      const up = new J3DIVector3(upx, upy, upz);
      forward.normalize();
      up.normalize();
      const right = new J3DIVector3();
      right.load(up);
      right.cross(forward);
      right.normalize();
      up.load(forward);
      up.cross(right);
      matrix.$matrix.m11 = right[0];
      matrix.$matrix.m21 = right[1];
      matrix.$matrix.m31 = right[2];
      matrix.$matrix.m12 = up[0];
      matrix.$matrix.m22 = up[1];
      matrix.$matrix.m32 = up[2];
      matrix.$matrix.m13 = forward[0];
      matrix.$matrix.m23 = forward[1];
      matrix.$matrix.m33 = forward[2];
      matrix.translate(-posx, -posy, -posz);
      this.multiply(matrix);
    };
    J3DIMatrix4.prototype.lookat = function (eyex, eyey, eyez, centerx, centery, centerz, upx, upy, upz) {
      if (typeof eyez === 'object' && 'length' in eyez) {
        let t = eyez;
        upx = t[0];
        upy = t[1];
        upz = t[2];
        t = eyey;
        centerx = t[0];
        centery = t[1];
        centerz = t[2];
        t = eyex;
        eyex = t[0];
        eyey = t[1];
        eyez = t[2];
      }
      const matrix = new J3DIMatrix4();
      let zx = centerx - eyex;
      let zy = centery - eyey;
      let zz = centerz - eyez;
      let mag = Math.sqrt(zx * zx + zy * zy + zz * zz);
      if (mag) {
        zx /= mag;
        zy /= mag;
        zz /= mag;
      }
      let yx = upx;
      let yy = upy;
      let yz = upz;
      let xx = yy * zz - yz * zy;
      let xy = -yx * zz + yz * zx;
      let xz = yx * zy - yy * zx;
      yx = zy * xz - zz * xy;
      yy = -zx * xz + zz * xx;
      yz = zx * xy - zy * xx;
      mag = Math.sqrt(xx * xx + xy * xy + xz * xz);
      if (mag) {
        xx /= mag;
        xy /= mag;
        xz /= mag;
      }
      mag = Math.sqrt(yx * yx + yy * yy + yz * yz);
      if (mag) {
        yx /= mag;
        yy /= mag;
        yz /= mag;
      }
      matrix.$matrix.m11 = xx;
      matrix.$matrix.m21 = xy;
      matrix.$matrix.m31 = xz;
      matrix.$matrix.m41 = 0;
      matrix.$matrix.m12 = yx;
      matrix.$matrix.m22 = yy;
      matrix.$matrix.m32 = yz;
      matrix.$matrix.m42 = 0;
      matrix.$matrix.m13 = zx;
      matrix.$matrix.m23 = zy;
      matrix.$matrix.m33 = zz;
      matrix.$matrix.m43 = 0;
      matrix.$matrix.m14 = 0;
      matrix.$matrix.m24 = 0;
      matrix.$matrix.m34 = 0;
      matrix.$matrix.m44 = 1;
      matrix.translate(-eyex, -eyey, -eyez);
      this.multiply(matrix);
    };
    J3DIMatrix4.prototype.decompose = function (_translate, _rotate, _scale, _skew, _perspective) {
      if (this.$matrix.m44 == 0) { return false; }
      const translate = (_translate == undefined || !('length' in _translate)) ? new J3DIVector3() : _translate;
      const rotate = (_rotate == undefined || !('length' in _rotate)) ? new J3DIVector3() : _rotate;
      const scale = (_scale == undefined || !('length' in _scale)) ? new J3DIVector3() : _scale;
      const skew = (_skew == undefined || !('length' in _skew)) ? new J3DIVector3() : _skew;
      const perspective = (_perspective == undefined || !('length' in _perspective)) ? new Array(4) : _perspective;
      const matrix = new J3DIMatrix4(this);
      matrix.divide(matrix.$matrix.m44);
      const perspectiveMatrix = new J3DIMatrix4(matrix);
      perspectiveMatrix.$matrix.m14 = 0;
      perspectiveMatrix.$matrix.m24 = 0;
      perspectiveMatrix.$matrix.m34 = 0;
      perspectiveMatrix.$matrix.m44 = 1;
      if (perspectiveMatrix._determinant4x4() == 0) { return false; }
      if (matrix.$matrix.m14 != 0 || matrix.$matrix.m24 != 0 || matrix.$matrix.m34 != 0) {
        const rightHandSide = [matrix.$matrix.m14, matrix.$matrix.m24, matrix.$matrix.m34, matrix.$matrix.m44];
        const inversePerspectiveMatrix = new J3DIMatrix4(perspectiveMatrix);
        inversePerspectiveMatrix.invert();
        const transposedInversePerspectiveMatrix = new J3DIMatrix4(inversePerspectiveMatrix);
        transposedInversePerspectiveMatrix.transpose();
        transposedInversePerspectiveMatrix.multVecMatrix(perspective, rightHandSide);
        matrix.$matrix.m14 = matrix.$matrix.m24 = matrix.$matrix.m34 = 0;
        matrix.$matrix.m44 = 1;
      } else {
        perspective[0] = perspective[1] = perspective[2] = 0;
        perspective[3] = 1;
      }
      translate[0] = matrix.$matrix.m41;
      matrix.$matrix.m41 = 0;
      translate[1] = matrix.$matrix.m42;
      matrix.$matrix.m42 = 0;
      translate[2] = matrix.$matrix.m43;
      matrix.$matrix.m43 = 0;
      const row0 = new J3DIVector3(matrix.$matrix.m11, matrix.$matrix.m12, matrix.$matrix.m13);
      const row1 = new J3DIVector3(matrix.$matrix.m21, matrix.$matrix.m22, matrix.$matrix.m23);
      const row2 = new J3DIVector3(matrix.$matrix.m31, matrix.$matrix.m32, matrix.$matrix.m33);
      scale[0] = row0.vectorLength();
      row0.divide(scale[0]);
      skew[0] = row0.dot(row1);
      row1.combine(row0, 1.0, -skew[0]);
      scale[1] = row1.vectorLength();
      row1.divide(scale[1]);
      skew[0] /= scale[1];
      skew[1] = row1.dot(row2);
      row2.combine(row0, 1.0, -skew[1]);
      skew[2] = row1.dot(row2);
      row2.combine(row1, 1.0, -skew[2]);
      scale[2] = row2.vectorLength();
      row2.divide(scale[2]);
      skew[1] /= scale[2];
      skew[2] /= scale[2];
      const pdum3 = new J3DIVector3(row1);
      pdum3.cross(row2);
      if (row0.dot(pdum3) < 0) {
        for (i = 0; i < 3; i++) {
          scale[i] *= -1;
          row[0][i] *= -1;
          row[1][i] *= -1;
          row[2][i] *= -1;
        }
      }
      rotate[1] = Math.asin(-row0[2]);
      if (Math.cos(rotate[1]) != 0) {
        rotate[0] = Math.atan2(row1[2], row2[2]);
        rotate[2] = Math.atan2(row0[1], row0[0]);
      } else {
        rotate[0] = Math.atan2(-row2[0], row1[1]);
        rotate[2] = 0;
      }
      const rad2deg = 180 / Math.PI;
      rotate[0] *= rad2deg;
      rotate[1] *= rad2deg;
      rotate[2] *= rad2deg;
      return true;
    };
    J3DIMatrix4.prototype._determinant2x2 = function (a, b, c, d) {
      return a * d - b * c;
    };
    J3DIMatrix4.prototype._determinant3x3 = function (a1, a2, a3, b1, b2, b3, c1, c2, c3) {
      return a1 * this._determinant2x2(b2, b3, c2, c3) -
          b1 * this._determinant2x2(a2, a3, c2, c3) +
          c1 * this._determinant2x2(a2, a3, b2, b3);
    };
    J3DIMatrix4.prototype._determinant4x4 = function () {
      const a1 = this.$matrix.m11;
      const b1 = this.$matrix.m12;
      const c1 = this.$matrix.m13;
      const d1 = this.$matrix.m14;
      const a2 = this.$matrix.m21;
      const b2 = this.$matrix.m22;
      const c2 = this.$matrix.m23;
      const d2 = this.$matrix.m24;
      const a3 = this.$matrix.m31;
      const b3 = this.$matrix.m32;
      const c3 = this.$matrix.m33;
      const d3 = this.$matrix.m34;
      const a4 = this.$matrix.m41;
      const b4 = this.$matrix.m42;
      const c4 = this.$matrix.m43;
      const d4 = this.$matrix.m44;
      return a1 * this._determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4) -
          b1 * this._determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4) +
          c1 * this._determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4) -
          d1 * this._determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
    };
    J3DIMatrix4.prototype._makeAdjoint = function () {
      const a1 = this.$matrix.m11;
      const b1 = this.$matrix.m12;
      const c1 = this.$matrix.m13;
      const d1 = this.$matrix.m14;
      const a2 = this.$matrix.m21;
      const b2 = this.$matrix.m22;
      const c2 = this.$matrix.m23;
      const d2 = this.$matrix.m24;
      const a3 = this.$matrix.m31;
      const b3 = this.$matrix.m32;
      const c3 = this.$matrix.m33;
      const d3 = this.$matrix.m34;
      const a4 = this.$matrix.m41;
      const b4 = this.$matrix.m42;
      const c4 = this.$matrix.m43;
      const d4 = this.$matrix.m44;
      this.$matrix.m11 = this._determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4);
      this.$matrix.m21 = -this._determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4);
      this.$matrix.m31 = this._determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4);
      this.$matrix.m41 = -this._determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
      this.$matrix.m12 = -this._determinant3x3(b1, b3, b4, c1, c3, c4, d1, d3, d4);
      this.$matrix.m22 = this._determinant3x3(a1, a3, a4, c1, c3, c4, d1, d3, d4);
      this.$matrix.m32 = -this._determinant3x3(a1, a3, a4, b1, b3, b4, d1, d3, d4);
      this.$matrix.m42 = this._determinant3x3(a1, a3, a4, b1, b3, b4, c1, c3, c4);
      this.$matrix.m13 = this._determinant3x3(b1, b2, b4, c1, c2, c4, d1, d2, d4);
      this.$matrix.m23 = -this._determinant3x3(a1, a2, a4, c1, c2, c4, d1, d2, d4);
      this.$matrix.m33 = this._determinant3x3(a1, a2, a4, b1, b2, b4, d1, d2, d4);
      this.$matrix.m43 = -this._determinant3x3(a1, a2, a4, b1, b2, b4, c1, c2, c4);
      this.$matrix.m14 = -this._determinant3x3(b1, b2, b3, c1, c2, c3, d1, d2, d3);
      this.$matrix.m24 = this._determinant3x3(a1, a2, a3, c1, c2, c3, d1, d2, d3);
      this.$matrix.m34 = -this._determinant3x3(a1, a2, a3, b1, b2, b3, d1, d2, d3);
      this.$matrix.m44 = this._determinant3x3(a1, a2, a3, b1, b2, b3, c1, c2, c3);
    };
    J3DIMatrix4.prototype.trace = function () {
      return this.$matrix.m11 + this.$matrix.m22 + this.$matrix.m33 + this.$matrix.m44;
    };
    J3DIMatrix4.prototype.loghat = function () {
      const r00 = this.$matrix.m11;
      const r01 = this.$matrix.m12;
      const r02 = this.$matrix.m13;
      const r10 = this.$matrix.m21;
      const r11 = this.$matrix.m22;
      const r12 = this.$matrix.m23;
      const r20 = this.$matrix.m31;
      const r21 = this.$matrix.m32;
      const r22 = this.$matrix.m33;
      const cosa = (r00 + r11 + r22 - 1.0) * 0.5;
      const aa = new J3DIVector3(r21 - r12,
        r02 - r20,
        r10 - r01);
      const twosina = aa.norm();
      let r;
      const sign = function (value) {
        return (value < 0 ? -1 : 1);
      };
      if (twosina < 1e-14) {
        if (Math.abs(r00 - r11) > 0.99 ||
          Math.abs(r00 - r22) > 0.99 ||
          Math.abs(r11 - r22) > 0.99) {
          if (Math.abs(r11 - r22) < 1e-14) {
            r = new J3DIVector3(Math.PI * sign(r00), 0, 0);
          } else if (Math.abs(r00 - r22) < 1e-14) {
            r = new J3DIVector3(0, Math.PI * sign(r11), 0);
          } else if (Math.abs(r00 - r11) < 1e-14) {
            r = new J3DIVector3(0, 0, Math.PI * sign(r22));
          } else {
            r = new J3DIVector3(0, 0, 0);
          }
        } else {
          r = new J3DIVector3(0, 0, 0);
        }
      } else {
        const alpha = Math.atan2(twosina * 0.5, cosa);
        r = aa.multiply(alpha / twosina);
      }
      return r;
    };
    class J3DIVector3 {
      constructor(x, y, z) {
        this.load(x, y, z);
      }
    }
    J3DIVector3.prototype.load = function (x, y, z) {
      if (typeof x === 'object' || typeof x === 'array') {
        this[0] = x[0];
        this[1] = x[1];
        this[2] = x[2];
      } else if (typeof x === 'number') {
        this[0] = x;
        this[1] = y;
        this[2] = z;
      } else {
        this[0] = 0;
        this[1] = 0;
        this[2] = 0;
      }
      return this;
    };
    J3DIVector3.prototype.getAsArray = function () {
      return [this[0], this[1], this[2]];
    };
    J3DIVector3.prototype.getAsFloat32Array = function () {
      return new Float32Array(this.getAsArray());
    };
    J3DIVector3.prototype.vectorLength = function () {
      return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
    };
    J3DIVector3.prototype.norm = function () {
      return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
    };
    J3DIVector3.prototype.cross = function (v) {
      const t0 = this[0]; const t1 = this[1]; const t2 = this[2];
      this[0] = t1 * v[2] - t2 * v[1];
      this[1] = -t0 * v[2] + t2 * v[0];
      this[2] = t0 * v[1] - t1 * v[0];
    };
    J3DIVector3.prototype.dot = function (v) {
      return this[0] * v[0] + this[1] * v[1] + this[2] * v[2];
    };
    J3DIVector3.prototype.combine = function (v, ascl, bscl) {
      this[0] = (ascl * this[0]) + (bscl * v[0]);
      this[1] = (ascl * this[1]) + (bscl * v[1]);
      this[2] = (ascl * this[2]) + (bscl * v[2]);
    };
    J3DIVector3.prototype.multiply = function (v) {
      if (typeof v === 'number') {
        this[0] *= v; this[1] *= v; this[2] *= v;
      } else {
        this[0] *= v[0]; this[1] *= v[1]; this[2] *= v[2];
      }
      return this;
    };
    J3DIVector3.prototype.divide = function (v) {
      if (typeof v === 'number') {
        this[0] /= v; this[1] /= v; this[2] /= v;
      } else {
        this[0] /= v[0]; this[1] /= v[1]; this[2] /= v[2];
      }
      return this;
    };
    J3DIVector3.prototype.subtract = function (v) {
      if (typeof v === 'number') {
        this[0] -= v; this[1] -= v; this[2] -= v;
      } else {
        this[0] -= v[0]; this[1] -= v[1]; this[2] -= v[2];
      }
      return this;
    };
    J3DIVector3.prototype.add = function (v) {
      if (typeof v === 'number') {
        this[0] += v; this[1] += v; this[2] += v; return this;
      } else {
        this[0] += v[0]; this[1] += v[1]; this[2] += v[2]; return this;
      }
    };
    J3DIVector3.prototype.neg = function () {
      this[0] = -this[0]; this[1] = -this[1]; this[2] = -this[2]; return this;
    };
    J3DIVector3.prototype.normalize = function () {
      const l = this.vectorLength();
      this[0] /= l;
      this[1] /= l;
      this[2] /= l;
      return this;
    };
    J3DIVector3.prototype.reflect = function (n) {
      const l = new J3DIVector3(this);
      this.multiply(n);
      this.multiply(2);
      this.multiply(n);
      this.subtract(l);
      return this;
    };
    J3DIVector3.prototype.multVecMatrix = function (matrix) {
      const x = this[0];
      const y = this[1];
      const z = this[2];
      this[0] = matrix.$matrix.m41 + x * matrix.$matrix.m11 + y * matrix.$matrix.m21 + z * matrix.$matrix.m31;
      this[1] = matrix.$matrix.m42 + x * matrix.$matrix.m12 + y * matrix.$matrix.m22 + z * matrix.$matrix.m32;
      this[2] = matrix.$matrix.m43 + x * matrix.$matrix.m13 + y * matrix.$matrix.m23 + z * matrix.$matrix.m33;
      const w = matrix.$matrix.m44 + x * matrix.$matrix.m14 + y * matrix.$matrix.m24 + z * matrix.$matrix.m34;
      if (w != 1 && w != 0) {
        this[0] /= w;
        this[1] /= w;
        this[2] /= w;
      }
      return this;
    };
    J3DIVector3.prototype.multNormalMatrix = function (matrix) {
      const x = this[0];
      const y = this[1];
      const z = this[2];
      const S = new J3DIMatrix4(matrix);
      S.invert();
      S.transpose();
      this[0] = S.$matrix.m41 + x * S.$matrix.m11 + y * S.$matrix.m21 + z * S.$matrix.m31;
      this[1] = S.$matrix.m42 + x * S.$matrix.m12 + y * S.$matrix.m22 + z * S.$matrix.m32;
      this[2] = S.$matrix.m43 + x * S.$matrix.m13 + y * S.$matrix.m23 + z * S.$matrix.m33;
      const w = S.$matrix.m44 + x * S.$matrix.m14 + y * S.$matrix.m24 + z * S.$matrix.m34;
      if (w != 1 && w != 0) {
        this[0] /= w;
        this[1] /= w;
        this[2] /= w;
      }
      return this;
    };
    J3DIVector3.prototype.hat = function () {
      const R = new J3DIMatrix4([
        0, -this[2], this[1], 0,
        this[2], 0, -this[0], 0,
        -this[1], this[0], 0, 0,
        0, 0, 0, 1
      ]);
      return R;
    };
    J3DIVector3.prototype.exphat = function () {
      const r = this;
      const theta = r.norm();
      const R = new J3DIMatrix4();
      if (Math.abs(theta) < 1e-14) {
      } else {
        const a = r.hat().multiply(Math.sin(theta) / theta).getAsArray();
        const b = r.hat().multiply(r.hat()).multiply((1 - Math.cos(theta)) / (theta * theta)).getAsArray();
        R.load([
          1 + a[0] + b[0], a[1] + b[1], a[2] + b[2], 0,
          a[4] + b[4], 1 + a[5] + b[5], a[6] + b[6], 0,
          a[8] + b[8], a[9] + b[9], 1 + a[10] + b[10], 0,
          0, 0, 0, 1
        ]);
      }
      return R;
    };
    J3DIVector3.prototype.toString = function () {
      return '[' + formatNumber(this[0]) + ',' + formatNumber(this[1]) + ',' + formatNumber(this[2]) + ']';
    };
    class J3DIVertexArray {
      constructor(array) {
        this.load(array);
      }
    }
    J3DIVertexArray.prototype.load = function (array) {
      if (array === undefined) {
        this.length = 0;
      } else {
        this.length = array.length;
        for (let i = 0; i < array.length; i++) {
          this[i] = array[i];
        }
      }
    };
    J3DIVertexArray.prototype.getAsArray = function () {
      const array = new Array(this.length);
      for (let i = 0; i < array.length; i++) {
        array[i] = this[i];
      }
      return array;
    };
    J3DIVertexArray.prototype.getAsFloat32Array = function () {
      return new Float32Array(this.getAsArray());
    };
    J3DIVertexArray.prototype.multVecMatrix = function (matrix) {
      for (let i = 0; i < this.length; i += 3) {
        const x = this[i];
        const y = this[i + 1];
        const z = this[i + 2];
        this[i] = matrix.$matrix.m41 + x * matrix.$matrix.m11 + y * matrix.$matrix.m21 + z * matrix.$matrix.m31;
        this[i + 1] = matrix.$matrix.m42 + x * matrix.$matrix.m12 + y * matrix.$matrix.m22 + z * matrix.$matrix.m32;
        this[i + 2] = matrix.$matrix.m43 + x * matrix.$matrix.m13 + y * matrix.$matrix.m23 + z * matrix.$matrix.m33;
        const w = matrix.$matrix.m44 + x * matrix.$matrix.m14 + y * matrix.$matrix.m24 + z * matrix.$matrix.m34;
        if (w != 1 && w != 0) {
          this[i] /= w;
          this[i + 1] /= w;
          this[i + 2] /= w;
        }
      }
    };
    J3DIVertexArray.prototype.normal = function (i1, i2, i3) {
      return this.rawNormal(i1, i2, i3).normalize();
    };
    J3DIVertexArray.prototype.rawNormal = function (i1, i2, i3) {
      const n = new J3DIVector3(this[i3 * 3] - this[i1 * 3], this[i3 * 3 + 1] - this[i1 * 3 + 1], this[i3 * 3 + 2] - this[i1 * 3 + 2]);
      n.cross(new J3DIVector3(this[i2 * 3] - this[i1 * 3], this[i2 * 3 + 1] - this[i1 * 3 + 1], this[i2 * 3 + 2] - this[i1 * 3 + 2]));
      return n;
    };
    const rawZReuse1 = new J3DIVector3();
    const rawZReuse2 = new J3DIVector3();
    J3DIVertexArray.prototype.rawZ = function (i1, i2, i3) {
      const n = rawZReuse1.load(this[i3 * 3] - this[i1 * 3], this[i3 * 3 + 1] - this[i1 * 3 + 1], this[i3 * 3 + 2] - this[i1 * 3 + 2]);
      n.cross(rawZReuse2.load(this[i2 * 3] - this[i1 * 3], this[i2 * 3 + 1] - this[i1 * 3 + 1], this[i2 * 3 + 2] - this[i1 * 3 + 2]));
      return n[2];
    };
    J3DIVertexArray.prototype.toString = function () {
      let str = '[';
      for (let i = 0; i < this.length; i++) {
        if (i > 0) {
          str += ',';
          if (i % 3 == 0) str += ' ';
        }
        str += formatNumber(this[i]);
      }
      str += ']';
      return str;
    };
    define('J3DIMath', [],
      function () {
        const clamp = function (value, min, max) {
          if (value === undefined || value != value) return min;
          return Math.max(min, Math.min(max, value));
        };
        const sign = function (value) {
          return (value < 0 ? -1 : 1);
        };
        const elerp = function (R1, R2, lambda) {
          const invR1 = new J3DIMatrix4(R1).transpose();
          const a = invR1.multiply(R2).loghat().multiply(lambda);
          const lerp = new J3DIMatrix4(R1);
          return lerp.multiply(a.exphat());
        };
        const rigidLerp = function (T1, T2, lambda) {
          lambda = clamp(lambda, 0, 1);
          const t1 = new J3DIVector3(T1.$matrix.m41, T1.$matrix.m42, T1.$matrix.m43);
          const R1 = new J3DIMatrix4(T1);
          R1.$matrix.m41 = 0;
          R1.$matrix.m42 = 0;
          R1.$matrix.m43 = 0;
          const t2 = new J3DIVector3(T2.$matrix.m41, T2.$matrix.m42, T2.$matrix.m43);
          const R2 = new J3DIMatrix4(T2);
          R2.$matrix.m41 = 0;
          R2.$matrix.m42 = 0;
          R2.$matrix.m43 = 0;
          const invR1 = new J3DIMatrix4(R1).transpose();
          const invR2 = new J3DIMatrix4(R2).transpose();
          t1.multVecMatrix(invR1).multiply(1 - lambda);
          t2.multVecMatrix(invR2).multiply(lambda);
          const t = new J3DIVector3(t1);
          t.add(t2);
          const a = invR1.multiply(R2).loghat().multiply(lambda);
          const lerp = new J3DIMatrix4(R1);
          lerp.multiply(a.exphat());
          t.multVecMatrix(lerp);
          lerp.$matrix.m41 = t[0];
          lerp.$matrix.m42 = t[1];
          lerp.$matrix.m43 = t[2];
          return lerp;
        };
        const intersectBox = function (ray, box) {
          const pMin = box.pMin; const pMax = box.pMax;
          let t0 = 0; let t1 = Number.MAX_VALUE;
          let face0 = -1; let face1 = -1;
          for (let i = 0; i < 3; i++) {
            const invRayDir = 1.0 / ray.dir[i];
            let tNear = (pMin[i] - ray.point[i]) * invRayDir;
            let tFar = (pMax[i] - ray.point[i]) * invRayDir;
            let faceSwap = 0;
            if (tNear > tFar) { const swap = tNear; tNear = tFar; tFar = swap; faceSwap = 3; }
            if (tNear > t0) { t0 = tNear; face0 = i + faceSwap; }
            if (tFar < t1) { t1 = tFar; face1 = i + 3 - faceSwap; }
            if (t0 > t1) return null;
          }
          let thit;
          let facehit;
          if (t0 < t1 && face0 != -1 || face1 == -1) {
            thit = t0;
            facehit = face0;
          } else {
            thit = t1;
            facehit = face1;
          }
          const phit = new J3DIVector3(ray.point).add(new J3DIVector3(ray.dir).multiply(thit));
          let u, v;
          switch (facehit) {
            case 0: {
              const dpdu = new J3DIVector3(0, 0, 1 / (pMax[2] - pMin[2]));
              const dpdv = new J3DIVector3(0, 1 / (pMax[1] - pMin[1]), 0);
              u = (phit[2] - pMin[2]) * dpdu[2];
              v = (phit[1] - pMin[1]) * dpdv[1];
              break;
            }
            case 3: {
              const dpdu = new J3DIVector3(0, 0, 1 / (pMax[2] - pMin[2]));
              const dpdv = new J3DIVector3(0, 1 / (pMax[1] - pMin[1]), 0);
              u = (phit[2] - pMin[2]) * dpdu[2];
              v = (phit[1] - pMin[1]) * dpdv[1];
              break;
            }
            case 1: {
              const dpdu = new J3DIVector3(1 / (pMax[0] - pMin[0]), 0, 0);
              const dpdv = new J3DIVector3(0, 0, 1 / (pMax[2] - pMin[2]));
              u = (phit[0] - pMin[0]) * dpdu[0];
              v = (phit[2] - pMin[2]) * dpdv[2];
              break;
            }
            case 4: {
              const dpdu = new J3DIVector3(1 / (pMax[0] - pMin[0]), 0, 0);
              const dpdv = new J3DIVector3(0, 0, 1 / (pMax[2] - pMin[2]));
              u = (phit[0] - pMin[0]) * dpdu[0];
              v = (phit[2] - pMin[2]) * dpdv[2];
              break;
            }
            case 2: {
              const dpdu = new J3DIVector3(1 / (pMax[0] - pMin[0]), 0, 0);
              const dpdv = new J3DIVector3(0, 1 / (pMax[1] - pMin[1]), 0);
              u = (phit[0] - pMin[0]) * dpdu[0];
              v = (phit[1] - pMin[1]) * dpdv[1];
              break;
            }
            case 5: {
              const dpdu = new J3DIVector3(1 / (pMax[0] - pMin[0]), 0, 0);
              const dpdv = new J3DIVector3(0, 1 / (pMax[1] - pMin[1]), 0);
              u = (phit[0] - pMin[0]) * dpdu[0];
              v = (phit[1] - pMin[1]) * dpdv[1];
              break;
            }
            default:
              return null;
          }
          return { point: phit, uv: new J3DIVector3(u, v, 0), t: thit, face: facehit };
        };
        const intersectPlane = function (ray, plane) {
          const divisor = ray.dir.dot(plane.normal);
          if (Math.abs(divisor) < 1e-20) {
            return null;
          }
          const thit = -(
            (new J3DIVector3(ray.point).subtract(plane.point)).dot(new J3DIVector3(plane.normal).divide(divisor))
          );
          const phit = new J3DIVector3(ray.point).add(new J3DIVector3(ray.dir).multiply(thit));
          const uv3d = new J3DIVector3(plane.point).subtract(phit);
          if (Math.abs(plane.normal[0]) > Math.abs(plane.normal[1]) && Math.abs(plane.normal[0]) > Math.abs(plane.normal[2])) {
            const uv = new J3DIVector3(uv3d[1], uv3d[2], 0);
          } else if (Math.abs(plane.normal[1]) > Math.abs(plane.normal[0]) && Math.abs(plane.normal[1]) > Math.abs(plane.normal[2])) {
            const uv = new J3DIVector3(uv3d[0], uv3d[2], 0);
          } else {
            const uv = new J3DIVector3(uv3d[0], uv3d[1], 0);
          }
          return { point: phit, uv: uv, t: t };
        };
        return {
          sign: sign,
          clamp: clamp,
          rigidLerp: rigidLerp,
          elerp: elerp,
          intersectPlane: intersectPlane,
          intersectBox: intersectBox,
          formatNumber: formatNumber
        };
      });
    'use strict';
    define('Node3D', ['J3DIMath'], function (J3DIMath) {
      class Node3D {
        constructor() {
          this.matrix = new J3DIMatrix4();
          this.children = [];
          this.parent = null;
        }
      }
      Node3D.prototype.transform = function (m) {
        if (this.parent != null) { this.parent.transform(m); }
        m.multiply(this.matrix);
      };
      Node3D.prototype.add = function (child) {
        if (child.parent != null) {
          child.parent.remove(child);
        }
        this.children[this.children.length] = child;
        child.parent = this;
      };
      Node3D.prototype.remove = function (child) {
        if (child.parent == this) {
          for (let i = 0; i < this.children.length; i++) {
            if (this.children[i] == child) {
              this.children = this.children.slice(0, i) + this.children.slice(i + 1);
              break;
            }
          }
          child.parent = null;
        }
      };
      return {
        Node3D: Node3D
      };
    });
    'use strict';
    define('PocketCube', ['Cube'],
      function (Cube) {
        class PocketCube extends Cube.Cube {
          constructor() {
            super(2);
            this.reset();
          }

          getPartLayerMask(part, orientation) {
            const face = this.getPartFace(part, orientation);
            if (part < this.cornerLoc.length) {
              return (face < 3) ? 2 : 1;
            } else {
              return 0;
            }
          }

          getPartSwipeAxis(part, orientation, swipeDirection) {
            if (part < this.cornerLoc.length) {
              const loc = this.getCornerLocation(part);
              const ori = (3 - this.getPartOrientation(part) + orientation) % 3;
              return this.CORNER_SWIPE_TABLE[loc][ori][swipeDirection][0];
            } else {
              return -1;
            }
          }

          getPartSwipeLayerMask(part, orientation, swipeDirection) {
            if (part < this.cornerLoc.length) {
              const loc = this.getCornerLocation(part);
              const ori = (3 - this.getPartOrientation(part) + orientation) % 3;
              return this.CORNER_SWIPE_TABLE[loc][ori][swipeDirection][1];
            } else {
              return 0;
            }
          }

          getPartSwipeAngle(part, orientation, swipeDirection) {
            if (part < this.cornerLoc.length) {
              const loc = this.getCornerLocation(part);
              const ori = this.getPartOrientation(part);
              const sori = (3 - ori + orientation) % 3;
              const dir = swipeDirection;
              let angle = this.CORNER_SWIPE_TABLE[loc][sori][dir][2];
              if (ori == 2 && (sori == 0 || sori == 2)) {
                angle = -angle;
              } else if (ori == 1 && (sori == 1 || sori == 2)) {
                angle = -angle;
              }
              return angle;
            } else {
              return 0;
            }
          }

          transform0(axis, layerMask, angle) {
            if (this.DEBUG) {
              window.console.log('PocketCube#' + (this) + '.transform(ax=' + axis + ',msk=' + layerMask + ',ang:' + angle + ')');
            }
            {
              if (axis < 0 || axis > 2) {
                throw ('axis: ' + axis);
              }
              if (layerMask < 0 || layerMask >= 1 << this.layerCount) {
                throw ('layerMask: ' + layerMask);
              }
              if (angle < -2 || angle > 2) {
                throw ('angle: ' + angle);
              }
              if (angle == 0) {
                return;
              }
              const an = (angle == -2) ? 2 : angle;
              if ((layerMask & 1) != 0) {
                switch (axis) {
                  case 0:
                    switch (an) {
                      case -1:
                        this.twistL();
                        break;
                      case 1:
                        this.twistL();
                        this.twistL();
                        this.twistL();
                        break;
                      case 2:
                        this.twistL();
                        this.twistL();
                        break;
                    }
                    break;
                  case 1:
                    switch (an) {
                      case -1:
                        this.twistD();
                        break;
                      case 1:
                        this.twistD();
                        this.twistD();
                        this.twistD();
                        break;
                      case 2:
                        this.twistD();
                        this.twistD();
                        break;
                    }
                    break;
                  case 2:
                    switch (an) {
                      case -1:
                        this.twistB();
                        break;
                      case 1:
                        this.twistB();
                        this.twistB();
                        this.twistB();
                        break;
                      case 2:
                        this.twistB();
                        this.twistB();
                        break;
                    }
                }
              }
              if ((layerMask & 2) != 0) {
                switch (axis) {
                  case 0:
                    switch (an) {
                      case 1:
                        this.twistR();
                        break;
                      case -1:
                        this.twistR();
                        this.twistR();
                        this.twistR();
                        break;
                      case 2:
                        this.twistR();
                        this.twistR();
                        break;
                    }
                    break;
                  case 1:
                    switch (an) {
                      case 1:
                        this.twistU();
                        break;
                      case -1:
                        this.twistU();
                        this.twistU();
                        this.twistU();
                        break;
                      case 2:
                        this.twistU();
                        this.twistU();
                        break;
                    }
                    break;
                  case 2:
                    switch (an) {
                      case 1:
                        this.twistF();
                        break;
                      case -1:
                        this.twistF();
                        this.twistF();
                        this.twistF();
                        break;
                      case 2:
                        this.twistF();
                        this.twistF();
                        break;
                    }
                }
              }
            }
          }

          twistR() {
            this.fourCycle(this.cornerLoc, 0, 1, 3, 2, this.cornerOrient, 1, 2, 1, 2, 3);
          }

          twistU() {
            this.fourCycle(this.cornerLoc, 0, 2, 4, 6, this.cornerOrient, 0, 0, 0, 0, 3);
          }

          twistF() {
            this.fourCycle(this.cornerLoc, 6, 7, 1, 0, this.cornerOrient, 1, 2, 1, 2, 3);
          }

          twistL() {
            this.fourCycle(this.cornerLoc, 6, 4, 5, 7, this.cornerOrient, 2, 1, 2, 1, 3);
          }

          twistD() {
            this.fourCycle(this.cornerLoc, 7, 5, 3, 1, this.cornerOrient, 0, 0, 0, 0, 3);
          }

          twistB() {
            this.fourCycle(this.cornerLoc, 2, 3, 5, 4, this.cornerOrient, 1, 2, 1, 2, 3);
          }

          toStickers() {
            throw new Error('Not supported yet.');
          }

          setToStickers(stickers) {
            throw new Error('Not supported yet.');
          }

          clone() {
            const that = new PocketCube();
            that.setTo(this);
            return that;
          }
        }
        PocketCube.prototype.DEBUG = false;
        PocketCube.prototype.NUMBER_OF_SIDE_PARTS = 0;
        PocketCube.prototype.NUMBER_OF_EDGE_PARTS = 0;
        PocketCube.prototype.SIDE_TRANSLATION = [];
        PocketCube.prototype.EDGE_TRANSLATION = [];
        PocketCube.prototype.CORNER_TRANSLATION = [
          [1, 3, 0, 0, 2, 1],
          [4, 1, 2, 3, 0, 2],
          [1, 1, 5, 0, 0, 1],
          [4, 3, 0, 3, 5, 3],
          [1, 0, 3, 0, 5, 1],
          [4, 2, 5, 3, 3, 2],
          [1, 2, 2, 0, 3, 1],
          [4, 0, 3, 3, 2, 2]
        ];
        PocketCube.prototype.EDGE_SWIPE_TABLE = [];
        PocketCube.prototype.SIDE_SWIPE_TABLE = [];
        const cornerParts = ['urf', 'dfr', 'ubr', 'drb', 'ulb', 'dbl', 'ufl', 'dlf'];
        const partMap = { center: 8 };
        for (let i = 0; i < cornerParts.length; i++) {
          const name = cornerParts[i];
          const key1 = name.charAt(0) + name.charAt(1) + name.charAt(2);
          const key2 = name.charAt(0) + name.charAt(2) + name.charAt(1);
          const key3 = name.charAt(1) + name.charAt(0) + name.charAt(2);
          const key4 = name.charAt(1) + name.charAt(2) + name.charAt(0);
          const key5 = name.charAt(2) + name.charAt(0) + name.charAt(1);
          const key6 = name.charAt(2) + name.charAt(1) + name.charAt(0);
          partMap[key1] = i;
          partMap[key2] = i;
          partMap[key3] = i;
          partMap[key4] = i;
          partMap[key5] = i;
          partMap[key6] = i;
        }
        PocketCube.prototype.NAME_PART_MAP = partMap;
        return {
          PocketCube: PocketCube,
          newPocketCube: function () {
            return new PocketCube();
          }
        };
      });
    'use strict';
    define('PocketCubeS1Cube3D', ['AbstractPocketCubeCube3D', 'CubeAttributes', 'PreloadPocketCubeS1'],
      function (AbstractPocketCubeCube3D, CubeAttributes, PreloadPocketCubeS1) {
        class PocketCubeS1Cube3D extends AbstractPocketCubeCube3D.AbstractPocketCubeCube3D {
          constructor(loadGeometry) {
            super(1.8);
          }

          loadGeometry() {
            super.loadGeometry();
            this.isDrawTwoPass = false;
          }

          getModelUrl() {
            return this.baseUrl + '/' + this.relativeUrl;
          }

          createAttributes() {
            const a = CubeAttributes.newCubeAttributes(this.partCount, 6 * 4, [4, 4, 4, 4, 4, 4]);
            const partsPhong = [0.5, 0.6, 0.4, 16.0];
            for (var i = 0; i < this.partCount; i++) {
              a.partsFillColor[i] = [24, 24, 24, 255];
              a.partsPhong[i] = partsPhong;
            }
            a.partsFillColor[this.centerOffset] = [240, 240, 240, 255];
            const faceColors = [
              [255, 210, 0, 155],
              [0, 51, 115, 255],
              [140, 0, 15, 255],
              [248, 248, 248, 255],
              [0, 115, 47, 255],
              [255, 70, 0, 255]
            ];
            const stickersPhong = [0.8, 0.2, 0.1, 8.0];
            for (var i = 0; i < 6; i++) {
              for (let j = 0; j < 4; j++) {
                a.stickersFillColor[i * 4 + j] = faceColors[i];
                a.stickersPhong[i * 4 + j] = stickersPhong;
              }
            }
            a.faceCount = 6;
            a.stickerOffsets = [0, 4, 8, 12, 16, 20];
            a.stickerCounts = [4, 4, 4, 4, 4, 4];
            return a;
          }
        }
        PocketCubeS1Cube3D.prototype.relativeUrl = 'models/pocketcubes1/';
        PocketCubeS1Cube3D.prototype.baseUrl = 'lib/';
        return {
          Cube3D: PocketCubeS1Cube3D,
          newCube3D: function () { const c = new PocketCubeS1Cube3D(); c.loadGeometry(); return c; }
        };
      });
    'use strict';
    define('PocketCubeS4Cube3D', ['AbstractPocketCubeCube3D', 'CubeAttributes', 'PreloadPocketCubeS4'],
      function (AbstractPocketCubeCube3D, CubeAttributes, PreloadPocketCubeS4) {
        const module = {
          log: (false) ? console.log : () => {},
          info: (true) ? console.info : () => {},
          warning: (true) ? console.warning : () => {},
          error: (true) ? console.error : () => {}
        };
        class PocketCubeS4Cube3D extends AbstractPocketCubeCube3D.AbstractPocketCubeCube3D {
          constructor() {
            super(1.8);
          }

          loadGeometry() {
            super.loadGeometry();
            this.isDrawTwoPass = false;
          }

          getModelUrl() {
            return this.baseUrl + '/' + this.relativeUrl;
          }

          createAttributes() {
            const a = CubeAttributes.newCubeAttributes(this.partCount, 6 * 4, [4, 4, 4, 4, 4, 4]);
            const partsPhong = [0.5, 0.6, 0.4, 16.0];
            for (var i = 0; i < this.partCount; i++) {
              a.partsFillColor[i] = [24, 24, 24, 255];
              a.partsPhong[i] = partsPhong;
            }
            a.partsFillColor[this.centerOffset] = [240, 240, 240, 255];
            const faceColors = [
              [255, 210, 0, 155],
              [0, 51, 115, 255],
              [140, 0, 15, 255],
              [248, 248, 248, 255],
              [0, 115, 47, 255],
              [255, 70, 0, 255]
            ];
            const stickersPhong = [0.8, 0.2, 0.1, 8.0];
            for (var i = 0; i < 6; i++) {
              for (let j = 0; j < 4; j++) {
                a.stickersFillColor[i * 4 + j] = faceColors[i];
                a.stickersPhong[i * 4 + j] = stickersPhong;
              }
            }
            a.faceCount = 6;
            a.stickerOffsets = [0, 4, 8, 12, 16, 20];
            a.stickerCounts = [4, 4, 4, 4, 4, 4];
            return a;
          }
        }
        PocketCubeS4Cube3D.prototype.relativeUrl = 'models/pocketcubes4/';
        PocketCubeS4Cube3D.prototype.baseUrl = 'lib/';
        return {
          Cube3D: PocketCubeS4Cube3D,
          newCube3D: function () { const c = new PocketCubeS4Cube3D(); c.loadGeometry(); return c; }
        };
      });
    'use strict';
    define('PocketCubeS5Cube3D', ['AbstractRubiksCubeCube3D', 'CubeAttributes', 'PreloadRubiksCubeS4', 'J3DIMath'],
      function (AbstractRubiksCubeCube3D, CubeAttributes, PreloadRubiksCubeS4, J3DIMath) {
        const module = {
          log: (false) ? console.log : () => {},
          info: (true) ? console.info : () => {},
          warning: (true) ? console.warning : () => {},
          error: (true) ? console.error : () => {}
        };
        class PocketCubeS5Cube3D extends AbstractRubiksCubeCube3D.AbstractRubiksCubeCube3D {
          constructor() {
            super(1.3, 6 * 4);
          }

          loadGeometry() {
            super.loadGeometry();
            this.isDrawTwoPass = false;
          }

          getModelUrl() {
            return this.baseUrl + '/' + this.relativeUrl;
          }

          createAttributes() {
            const a = CubeAttributes.newCubeAttributes(this.partCount, 6 * 4, [4, 4, 4, 4, 4, 4]);
            const partsPhong = [0.5, 0.6, 0.4, 16.0];
            for (var i = 0; i < this.partCount; i++) {
              a.partsPhong[i] = partsPhong;
            }
            for (var i = 0; i < 8; i++) {
              a.partsFillColor[i] = [24, 24, 24, 255];
            }
            for (var i = 8; i < this.partCount; i++) {
              a.partsFillColor[i] = [240, 240, 240, 255];
            }
            const faceColors = [
              [255, 210, 0, 155],
              [0, 51, 115, 255],
              [140, 0, 15, 255],
              [248, 248, 248, 255],
              [0, 115, 47, 255],
              [255, 70, 0, 255]
            ];
            const stickersPhong = [0.8, 0.2, 0.1, 8.0];
            for (var i = 0; i < 6; i++) {
              for (let j = 0; j < 9; j++) {
                a.stickersFillColor[i * 9 + j] = faceColors[i];
                a.stickersPhong[i * 9 + j] = stickersPhong;
              }
            }
            a.faceCount = 6;
            a.stickerOffsets = [0, 4, 8, 12, 16, 20];
            a.stickerCounts = [4, 4, 4, 4, 4, 4];
            return a;
          }

          intersect(ray) {
            const cubeSize = this.partSize * 2;
            const box = {
              pMin: new J3DIVector3(-cubeSize / 2, -cubeSize / 2, -cubeSize / 2),
              pMax: new J3DIVector3(cubeSize / 2, cubeSize / 2, cubeSize / 2)
            };
            let isect = J3DIMath.intersectBox(ray, box);
            if (isect != null) {
              const face = isect.face;
              let u = Math.floor(isect.uv[0] * 2);
              let v = Math.floor(isect.uv[1] * 2);
              if (u == 1) u = 2;
              if (v == 1) v = 2;
              isect.location = this.boxClickToLocationMap[face][u][v];
              isect.axis = this.boxClickToAxisMap[face][u][v];
              isect.layerMask = this.boxClickToLayerMap[face][u][v];
              isect.angle = this.boxClickToAngleMap[face][u][v];
              isect.part = this.cube.getPartAt(isect.location);
              if (!this.attributes.isPartVisible(isect.part)) {
                isect = null;
              }
            }
            return isect;
          }
        }
        PocketCubeS5Cube3D.prototype.relativeUrl = 'models/pocketcubes5/';
        PocketCubeS5Cube3D.prototype.baseUrl = 'lib/';
        return {
          Cube3D: PocketCubeS5Cube3D,
          newCube3D: function () { const c = new PocketCubeS5Cube3D(); c.loadGeometry(); return c; }
        };
      });
    'use strict';
    define('PreloadPocketCubeS1', ['J3DI'],
      function (J3DI) {
        J3DI.setFileData('lib/models/pocketcubes1/corner.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng corner\nv 0.1 0 1.9\nv 1.9 0 1.9\nv 1.9 0 0.1\nv 0.1 0 0.1\nv 0.1 0.1 2\nv 1.9 0.1 2\nv 2 0.1 1.9\nv 2 0.1 0.1\nv 1.9 0.1 0\nv 0.1 0.1 0\nv 0 0.1 0.1\nv 0 0.1 1.9\nv 0.1 1.9 2\nv 1.9 1.9 2\nv 2 1.9 1.9\nv 2 1.9 0.1\nv 1.9 1.9 0\nv 0.1 1.9 0\nv 0 1.9 0.1\nv 0 1.9 1.9\nv 0.1 2 1.9\nv 1.9 2 1.9\nv 1.9 2 0.1\nv 0.1 2 0.1\n\nvt 0.959869 0 0\nvt 0.919738 0 0\nvt 0 1 0\nvt 0 0 0\nvt 0 0 0\nvt 0.959869 0 0\nvt 1 1 0\nvt 0.919738 0 0\nvt 0 0 0\nvt 0.959869 0 0\nvt 0.919738 0 0\nvt 1 0 0\nvt 0 0 0\nvt 0.959869 0 0\nvt 0.919738 0 0\nvt 1 0.074299 0\nvt 0 0.074299 0\nvt 0.919738 0.074299 0\nvt 0 0.074299 0\nvt 1 0.074299 0\nvt 0.919738 0.074299 0\nvt 0 0.074299 0\nvt 1 0.074299 0\nvt 0.919738 0.074299 0\nvt 0 0.074299 0\nvt 1 0.074299 0\nvt 0.919738 0.074299 0\nvt 1 0.925701 0\nvt 0 0.925701 0\nvt 0.919738 0.925701 0\nvt 0 0.925701 0\nvt 1 0.925701 0\nvt 0.919738 0.925701 0\nvt 0 0.925701 0\nvt 1 0.925701 0\nvt 0.919738 0.925701 0\nvt 0 0.925701 0\nvt 1 0.925701 0\nvt 0.919738 0.925701 0\nvt 0.919738 1 0\nvt 0.959869 1 0\nvt 0 1 0\nvt 0 1 0\nvt 0.959869 1 0\nvt 0.919738 1 0\nvt 0 1 0\nvt 0.959869 1 0\nvt 0.919738 1 0\nvt 0 1 0\nvt 0.959869 1 0\nvt 0.919738 1 0\n\nf 2/8 6/18 5/17 1/4 \nf 4/13 3/12 2/7 1/3 \nf 14/30 22/45 21/42 13/29 \nf 7/20 6/18 2/6 \nf 7/20 15/32 14/30 6/18 \nf 15/32 22/44 14/30 \nf 3/11 8/21 7/19 2/5 \nf 13/28 21/41 20/39 \nf 16/33 23/48 22/43 15/31 \nf 9/23 8/21 3/10 \nf 9/23 17/35 16/33 8/21 \nf 17/35 23/47 16/33 \nf 4/15 10/24 9/22 3/9 \nf 10/24 18/36 17/34 9/22 \nf 18/36 24/51 23/46 17/34 \nf 11/26 10/24 4/14 \nf 11/26 19/38 18/36 10/24 \nf 19/38 24/50 18/36 \nf 1/2 12/27 11/25 4/13 \nf 12/27 20/39 19/37 11/25 \nf 20/39 21/40 24/49 19/37 \nf 5/16 12/27 1/1 \nf 5/16 13/28 20/39 12/27 \n\n'
        );
        J3DI.setFileData('lib/models/pocketcubes1/corner_r.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng corner_r corner_f\nusemtl Stickers\nv 2 0.1 1.9\nv 2 1.9 1.9\nv 2 0.1 0.1\nv 2 1.9 0.1\nv 1.8 0.1 0.1\nv 1.8 1.9 0.1\nv 1.8 0.1 1.9\nv 1.8 1.9 1.9\n\nvt 0.05 0.05 0.05\nvt 0.05 0.95 0.05\nvt 0.95 0.05 0.05\nvt 0.95 0.95 0.05\n\nf 3/3 4/4 2/2 1/1 \n\n'
        );
        J3DI.setFileData('lib/models/pocketcubes1/corner_u.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng corner_u corner_f\nusemtl Stickers\nv 0.1 2 1.9\nv 0.1 2 0.1\nv 1.9 2 1.9\nv 1.9 2 0.1\nv 1.9 1.8 1.9\nv 1.9 1.8 0.1\nv 0.1 1.8 1.9\nv 0.1 1.8 0.1\n\nvt 0.05 0.05 0.05\nvt 0.05 0.95 0.05\nvt 0.95 0.05 0.05\nvt 0.95 0.95 0.05\n\nf 3/3 4/4 2/2 1/1 \n\n'
        );
        J3DI.setFileData('lib/models/pocketcubes1/corner_f.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng corner_f\nusemtl Stickers\nv 0.1 0.1 2\nv 0.1 1.9 2\nv 1.9 0.1 2\nv 1.9 1.9 2\nv 1.9 0.1 1.8\nv 1.9 1.9 1.8\nv 0.1 0.1 1.8\nv 0.1 1.9 1.8\n\nvt 0.05 0.05 0.05\nvt 0.05 0.95 0.05\nvt 0.95 0.05 0.05\nvt 0.95 0.95 0.05\n\nf 3/3 4/4 2/2 1/1 \n\n'
        );
        J3DI.setFileData('lib/models/pocketcubes1/center.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng center_1 centerCube Face_1\nv -0.3 -0.3 0.3\nv -0.3 0.3 0.3\nv 0.3 -0.3 0.3\nv 0.3 0.3 0.3\n\nvt 0 0 0\nvt 0 1 0\nvt 1 0 0\nvt 1 1 0\n\nf 3/3 4/4 2/2 1/1 \n\ng center_1 centerCube Face_2\nv 0.3 -0.3 0.3\nv 0.3 0.3 0.3\nv 0.3 -0.3 -0.3\nv 0.3 0.3 -0.3\n\nvt 0 0 0\nvt 0 1 0\nvt 1 0 0\nvt 1 1 0\n\nf 7/7 8/8 6/6 5/5 \n\ng center_1 centerCube Face_3\nv 0.3 -0.3 -0.3\nv 0.3 0.3 -0.3\nv -0.3 -0.3 -0.3\nv -0.3 0.3 -0.3\n\nvt 0 0 0\nvt 0 1 0\nvt 1 0 0\nvt 1 1 0\n\nf 11/11 12/12 10/10 9/9 \n\ng center_1 centerCube Face_4\nv -0.3 -0.3 -0.3\nv -0.3 0.3 -0.3\nv -0.3 -0.3 0.3\nv -0.3 0.3 0.3\n\nvt 0 0 0\nvt 0 1 0\nvt 1 0 0\nvt 1 1 0\n\nf 15/15 16/16 14/14 13/13 \n\ng center_1 centerCube Face_5\nv -0.3 0.3 0.3\nv -0.3 0.3 -0.3\nv 0.3 0.3 0.3\nv 0.3 0.3 -0.3\n\nvt 0 0 0\nvt 0 1 0\nvt 1 0 0\nvt 1 1 0\n\nf 19/19 20/20 18/18 17/17 \n\ng center_1 centerCube Face_6\nv -0.3 -0.3 -0.3\nv -0.3 -0.3 0.3\nv 0.3 -0.3 -0.3\nv 0.3 -0.3 0.3\n\nvt 0 0 0\nvt 0 1 0\nvt 1 0 0\nvt 1 1 0\n\nf 23/23 24/24 22/22 21/21 \n\ng center_1 Instance1\nv 0.9 -0.141421 0.141421\nv 0.9 -0.141421 0.141421\nv -0.9 -0.2 0\nv -0.9 -0.2 0\nv -0.3 -0.2 0\nv 0.3 -0.2 0\nv 0.9 -0.2 0\nv 0.9 -0.2 0\nv -0.9 -0.141421 -0.141421\nv -0.9 -0.141421 -0.141421\nv -0.3 -0.141421 -0.141421\nv 0.3 -0.141421 -0.141421\nv 0.9 -0.141421 -0.141421\nv 0.9 -0.141421 -0.141421\nv -0.9 0 -0.2\nv -0.9 0 -0.2\nv -0.3 0 -0.2\nv 0.3 0 -0.2\nv 0.9 0 -0.2\nv 0.9 0 -0.2\nv -0.9 0.141421 -0.141421\nv -0.9 0.141421 -0.141421\nv -0.3 0.141421 -0.141421\nv 0.3 0.141421 -0.141421\nv 0.9 0.141421 -0.141421\nv 0.9 0.141421 -0.141421\nv -0.9 0.2 0\nv -0.9 0.2 0\nv -0.3 0.2 0\nv 0.3 0.2 0\nv 0.9 0.2 0\nv 0.9 0.2 0\nv -0.9 0.141421 0.141421\nv -0.9 0.141421 0.141421\nv -0.3 0.141421 0.141421\nv 0.3 0.141421 0.141421\nv 0.9 0.141421 0.141421\nv 0.9 0.141421 0.141421\nv -0.9 0 0.2\nv -0.9 0 0.2\nv -0.3 0 0.2\nv 0.3 0 0.2\nv 0.9 0 0.2\nv 0.9 0 0.2\nv -0.9 -0.141421 0.141421\nv -0.9 -0.141421 0.141421\nv -0.3 -0.141421 0.141421\nv 0.3 -0.141421 0.141421\n\nvt 0.875 1 0\nvt 0.853554 0.146447 0\nvt 0 0.5 0\nvt 1 0 0\nvt 0 0 0\nvt 1 0.333333 0\nvt 0 0.333333 0\nvt 1 0.666667 0\nvt 0 0.666667 0\nvt 1 1 0\nvt 0 1 0\nvt 1 0.5 0\nvt 0.146447 0.853553 0\nvt 0.125 0 0\nvt 0.125 0.333333 0\nvt 0.125 0.666667 0\nvt 0.125 1 0\nvt 0.853553 0.853553 0\nvt 0.5 1 0\nvt 0.25 0 0\nvt 0.25 0.333333 0\nvt 0.25 0.666667 0\nvt 0.25 1 0\nvt 0.5 1 0\nvt 0.853553 0.853553 0\nvt 0.375 0 0\nvt 0.375 0.333333 0\nvt 0.375 0.666667 0\nvt 0.375 1 0\nvt 0.146447 0.853553 0\nvt 1 0.5 0\nvt 0.5 0 0\nvt 0.5 0.333333 0\nvt 0.5 0.666667 0\nvt 0.5 1 0\nvt 0 0.5 0\nvt 0.853553 0.146447 0\nvt 0.625 0 0\nvt 0.625 0.333333 0\nvt 0.625 0.666667 0\nvt 0.625 1 0\nvt 0.146447 0.146447 0\nvt 0.5 0 0\nvt 0.75 0 0\nvt 0.75 0.333333 0\nvt 0.75 0.666667 0\nvt 0.75 1 0\nvt 0.5 0 0\nvt 0.146446 0.146447 0\nvt 0.875 0 0\nvt 0.875 0.333333 0\nvt 0.875 0.666667 0\n\nf 32/36 38/42 44/48 50/54 56/60 62/66 68/72 26/26 \nf 57/61 51/55 45/49 39/43 33/37 27/27 69/73 63/67 \nf 34/38 35/39 29/31 28/29 \nf 36/40 37/41 31/35 30/33 \nf 40/44 41/45 35/39 34/38 \nf 72/76 25/25 67/71 66/70 \nf 42/46 43/47 37/41 36/40 \nf 46/50 47/51 41/45 40/44 \nf 48/52 49/53 43/47 42/46 \nf 66/70 67/71 61/65 60/64 \nf 52/56 53/57 47/51 46/50 \nf 70/74 71/75 65/69 64/68 \nf 54/58 55/59 49/53 48/52 \nf 64/68 65/69 59/63 58/62 \nf 30/32 31/34 25/25 72/76 \nf 58/62 59/63 53/57 52/56 \nf 28/28 29/30 71/75 70/74 \nf 60/64 61/65 55/59 54/58 \n\ng center_1 Instance\nv 0.141421 -0.141421 0.9\nv 0.141421 -0.141421 0.9\nv 0.2 0 -0.9\nv 0.2 0 -0.9\nv 0.2 0 -0.3\nv 0.2 0 0.3\nv 0.2 0 0.9\nv 0.2 0 0.9\nv 0.141421 0.141421 -0.9\nv 0.141421 0.141421 -0.9\nv 0.141421 0.141421 -0.3\nv 0.141421 0.141421 0.3\nv 0.141421 0.141421 0.9\nv 0.141421 0.141421 0.9\nv 0 0.2 -0.9\nv 0 0.2 -0.9\nv 0 0.2 -0.3\nv 0 0.2 0.3\nv 0 0.2 0.9\nv 0 0.2 0.9\nv -0.141421 0.141421 -0.9\nv -0.141421 0.141421 -0.9\nv -0.141421 0.141421 -0.3\nv -0.141421 0.141421 0.3\nv -0.141421 0.141421 0.9\nv -0.141421 0.141421 0.9\nv -0.2 0 -0.9\nv -0.2 0 -0.9\nv -0.2 0 -0.3\nv -0.2 0 0.3\nv -0.2 0 0.9\nv -0.2 0 0.9\nv -0.141421 -0.141421 -0.9\nv -0.141421 -0.141421 -0.9\nv -0.141421 -0.141421 -0.3\nv -0.141421 -0.141421 0.3\nv -0.141421 -0.141421 0.9\nv -0.141421 -0.141421 0.9\nv 0 -0.2 -0.9\nv 0 -0.2 -0.9\nv 0 -0.2 -0.3\nv 0 -0.2 0.3\nv 0 -0.2 0.9\nv 0 -0.2 0.9\nv 0.141421 -0.141421 -0.9\nv 0.141421 -0.141421 -0.9\nv 0.141421 -0.141421 -0.3\nv 0.141421 -0.141421 0.3\n\nvt 0.875 1 0\nvt 0.5 0.5 0\nvt 0.853553 0.853553 0\nvt 0 0.5 0\nvt 1 0 0\nvt 0 0 0\nvt 1 0.333333 0\nvt 0 0.333333 0\nvt 1 0.666667 0\nvt 0 0.666667 0\nvt 1 1 0\nvt 0 1 0\nvt 1 0.5 0\nvt 0.146447 0.853553 0\nvt 0.125 0 0\nvt 0.125 0.333333 0\nvt 0.125 0.666667 0\nvt 0.125 1 0\nvt 0.853553 0.853553 0\nvt 0.5 1 0\nvt 0.25 0 0\nvt 0.25 0.333333 0\nvt 0.25 0.666667 0\nvt 0.25 1 0\nvt 0.5 1 0\nvt 0.853553 0.853553 0\nvt 0.375 0 0\nvt 0.375 0.333333 0\nvt 0.375 0.666667 0\nvt 0.375 1 0\nvt 0.146447 0.853553 0\nvt 1 0.5 0\nvt 0.5 0 0\nvt 0.5 0.333333 0\nvt 0.5 0.666667 0\nvt 0.5 1 0\nvt 0 0.5 0\nvt 0.853553 0.146447 0\nvt 0.625 0 0\nvt 0.625 0.333333 0\nvt 0.625 0.666667 0\nvt 0.625 1 0\nvt 0.146447 0.146447 0\nvt 0.5 0 0\nvt 0.75 0 0\nvt 0.75 0.333333 0\nvt 0.75 0.666667 0\nvt 0.75 1 0\nvt 0.5 0 0\nvt 0.146446 0.146447 0\nvt 0.875 0 0\nvt 0.875 0.333333 0\nvt 0.875 0.666667 0\n\nf 86/95 92/101 98/107 104/113 110/119 116/125 74/79 80/89 \nf 105/114 99/108 93/102 87/96 81/90 75/80 117/126 111/120 \nf 82/91 83/92 77/84 76/82 \nf 76/81 77/83 119/128 118/127 \nf 84/93 85/94 79/88 78/86 \nf 88/97 89/98 83/92 82/91 \nf 78/85 79/87 73/77 120/129 \nf 90/99 91/100 85/94 84/93 \nf 94/103 95/104 89/98 88/97 \nf 96/105 97/106 91/100 90/99 \nf 118/127 119/128 113/122 112/121 \nf 100/109 101/110 95/104 94/103 \nf 120/129 73/77 115/124 114/123 \nf 102/111 103/112 97/106 96/105 \nf 114/123 115/124 109/118 108/117 \nf 112/121 113/122 107/116 106/115 \nf 106/115 107/116 101/110 100/109 \nf 108/117 109/118 103/112 102/111 \n\ng center_1 centerCylinder\nv 0.141421 0.9 0.141421\nv 0.141421 0.9 0.141421\nv 0.2 -0.9 0\nv 0.2 -0.9 0\nv 0.2 -0.3 0\nv 0.2 0.3 0\nv 0.2 0.9 0\nv 0.2 0.9 0\nv 0.141421 -0.9 -0.141421\nv 0.141421 -0.9 -0.141421\nv 0.141421 -0.3 -0.141421\nv 0.141421 0.3 -0.141421\nv 0.141421 0.9 -0.141421\nv 0.141421 0.9 -0.141421\nv 0 -0.9 -0.2\nv 0 -0.9 -0.2\nv 0 -0.3 -0.2\nv 0 0.3 -0.2\nv 0 0.9 -0.2\nv 0 0.9 -0.2\nv -0.141421 -0.9 -0.141421\nv -0.141421 -0.9 -0.141421\nv -0.141421 -0.3 -0.141421\nv -0.141421 0.3 -0.141421\nv -0.141421 0.9 -0.141421\nv -0.141421 0.9 -0.141421\nv -0.2 -0.9 0\nv -0.2 -0.9 0\nv -0.2 -0.3 0\nv -0.2 0.3 0\nv -0.2 0.9 0\nv -0.2 0.9 0\nv -0.141421 -0.9 0.141421\nv -0.141421 -0.9 0.141421\nv -0.141421 -0.3 0.141421\nv -0.141421 0.3 0.141421\nv -0.141421 0.9 0.141421\nv -0.141421 0.9 0.141421\nv 0 -0.9 0.2\nv 0 -0.9 0.2\nv 0 -0.3 0.2\nv 0 0.3 0.2\nv 0 0.9 0.2\nv 0 0.9 0.2\nv 0.141421 -0.9 0.141421\nv 0.141421 -0.9 0.141421\nv 0.141421 -0.3 0.141421\nv 0.141421 0.3 0.141421\n\nvt 0.875 1 0\nvt 0.5 0.5 0\nvt 0.853553 0.853553 0\nvt 0 0.5 0\nvt 1 0 0\nvt 0 0 0\nvt 1 0.333333 0\nvt 0 0.333333 0\nvt 1 0.666667 0\nvt 0 0.666667 0\nvt 1 1 0\nvt 0 1 0\nvt 1 0.5 0\nvt 0.146447 0.853553 0\nvt 0.125 0 0\nvt 0.125 0.333333 0\nvt 0.125 0.666667 0\nvt 0.125 1 0\nvt 0.853553 0.853553 0\nvt 0.5 1 0\nvt 0.25 0 0\nvt 0.25 0.333333 0\nvt 0.25 0.666667 0\nvt 0.25 1 0\nvt 0.5 1 0\nvt 0.853553 0.853553 0\nvt 0.375 0 0\nvt 0.375 0.333333 0\nvt 0.375 0.666667 0\nvt 0.375 1 0\nvt 0.146447 0.853553 0\nvt 1 0.5 0\nvt 0.5 0 0\nvt 0.5 0.333333 0\nvt 0.5 0.666667 0\nvt 0.5 1 0\nvt 0 0.5 0\nvt 0.853553 0.146447 0\nvt 0.625 0 0\nvt 0.625 0.333333 0\nvt 0.625 0.666667 0\nvt 0.625 1 0\nvt 0.146447 0.146447 0\nvt 0.5 0 0\nvt 0.75 0 0\nvt 0.75 0.333333 0\nvt 0.75 0.666667 0\nvt 0.75 1 0\nvt 0.5 0 0\nvt 0.146446 0.146447 0\nvt 0.875 0 0\nvt 0.875 0.333333 0\nvt 0.875 0.666667 0\n\nf 134/148 140/154 146/160 152/166 158/172 164/178 122/132 128/142 \nf 153/167 147/161 141/155 135/149 129/143 123/133 165/179 159/173 \nf 130/144 131/145 125/137 124/135 \nf 124/134 125/136 167/181 166/180 \nf 132/146 133/147 127/141 126/139 \nf 136/150 137/151 131/145 130/144 \nf 126/138 127/140 121/130 168/182 \nf 138/152 139/153 133/147 132/146 \nf 142/156 143/157 137/151 136/150 \nf 144/158 145/159 139/153 138/152 \nf 166/180 167/181 161/175 160/174 \nf 148/162 149/163 143/157 142/156 \nf 168/182 121/130 163/177 162/176 \nf 150/164 151/165 145/159 144/158 \nf 162/176 163/177 157/171 156/170 \nf 160/174 161/175 155/169 154/168 \nf 154/168 155/169 149/163 148/162 \nf 156/170 157/171 151/165 150/164 \n\n'
        );
        return { };
      });
    'use strict';
    define('PreloadPocketCubeS4', ['J3DI'],
      function (J3DI) {
        J3DI.setFileData('lib/models/pocketcubes4/corner.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng corner\nv 0.1 0 1.9\nv 1.9 0 1.9\nv 1.9 0 0.1\nv 0.1 0 0.1\nv 0.1 0.013397 1.95\nv 1.9 0.013397 1.95\nv 1.925 0.013397 1.943301\nv 1.943301 0.013397 1.925\nv 1.95 0.013397 1.9\nv 1.95 0.013397 0.1\nv 1.943301 0.013397 0.075\nv 1.925 0.013397 0.056699\nv 1.9 0.013397 0.05\nv 0.1 0.013397 0.05\nv 0.075 0.013397 0.056699\nv 0.056699 0.013397 0.075\nv 0.05 0.013397 0.1\nv 0.05 0.013397 1.9\nv 0.056699 0.013397 1.925\nv 0.075 0.013397 1.943301\nv 0.1 0.05 1.986603\nv 1.9 0.05 1.986603\nv 1.943301 0.05 1.975\nv 1.975 0.05 1.943301\nv 1.986603 0.05 1.9\nv 1.986603 0.05 0.1\nv 1.975 0.05 0.056699\nv 1.943301 0.05 0.025\nv 1.9 0.05 0.013397\nv 0.1 0.05 0.013397\nv 0.056699 0.05 0.025\nv 0.025 0.05 0.056699\nv 0.013397 0.05 0.1\nv 0.013397 0.05 1.9\nv 0.025 0.05 1.943301\nv 0.056699 0.05 1.975\nv 0.1 0.1 2\nv 1.9 0.1 2\nv 1.95 0.1 1.986603\nv 1.986603 0.1 1.95\nv 2 0.1 1.9\nv 2 0.1 0.1\nv 1.986603 0.1 0.05\nv 1.95 0.1 0.013397\nv 1.9 0.1 0\nv 0.1 0.1 0\nv 0.05 0.1 0.013397\nv 0.013397 0.1 0.05\nv 0 0.1 0.1\nv 0 0.1 1.9\nv 0.013397 0.1 1.95\nv 0.05 0.1 1.986603\nv 0.1 1.9 2\nv 1.9 1.9 2\nv 1.95 1.9 1.986603\nv 1.986603 1.9 1.95\nv 2 1.9 1.9\nv 2 1.9 0.1\nv 1.986603 1.9 0.05\nv 1.95 1.9 0.013397\nv 1.9 1.9 0\nv 0.1 1.9 0\nv 0.05 1.9 0.013397\nv 0.013397 1.9 0.05\nv 0 1.9 0.1\nv 0 1.9 1.9\nv 0.013397 1.9 1.95\nv 0.05 1.9 1.986603\nv 0.1 1.95 1.986603\nv 1.9 1.95 1.986603\nv 1.943301 1.95 1.975\nv 1.975 1.95 1.943301\nv 1.986603 1.95 1.9\nv 1.986603 1.95 0.1\nv 1.975 1.95 0.056699\nv 1.943301 1.95 0.025\nv 1.9 1.95 0.013397\nv 0.1 1.95 0.013397\nv 0.056699 1.95 0.025\nv 0.025 1.95 0.056699\nv 0.013397 1.95 0.1\nv 0.013397 1.95 1.9\nv 0.025 1.95 1.943301\nv 0.056699 1.95 1.975\nv 0.1 1.986603 1.95\nv 1.9 1.986603 1.95\nv 1.925 1.986603 1.943301\nv 1.943301 1.986603 1.925\nv 1.95 1.986603 1.9\nv 1.95 1.986603 0.1\nv 1.943301 1.986603 0.075\nv 1.925 1.986603 0.056699\nv 1.9 1.986603 0.05\nv 0.1 1.986603 0.05\nv 0.075 1.986603 0.056699\nv 0.056699 1.986603 0.075\nv 0.05 1.986603 0.1\nv 0.05 1.986603 1.9\nv 0.056699 1.986603 1.925\nv 0.075 1.986603 1.943301\nv 0.1 2 1.9\nv 1.9 2 1.9\nv 1.9 2 0.1\nv 0.1 2 0.1\n\nvt 0.986623 0 0\nvt 0.959869 0 0\nvt 0.933115 0 0\nvt 0.919738 0 0\nvt 0 1 0\nvt 0 0 0\nvt 1 1 0\nvt 0 0 0\nvt 0.986623 0 0\nvt 0.959869 0 0\nvt 0.933115 0 0\nvt 0.919738 0 0\nvt 0 0 0\nvt 0.986623 0 0\nvt 0.959869 0 0\nvt 0.933115 0 0\nvt 1 0 0\nvt 0.919738 0 0\nvt 0 0 0\nvt 0.986623 0 0\nvt 0.959869 0 0\nvt 0.933115 0 0\nvt 0.919738 0 0\nvt 1 0.024766 0\nvt 0 0.024766 0\nvt 0.919738 0.024766 0\nvt 0.946492 0.024766 0\nvt 0.973246 0.024766 0\nvt 0 0.024766 0\nvt 1 0.024766 0\nvt 0.919738 0.024766 0\nvt 0.946492 0.024766 0\nvt 0.973246 0.024766 0\nvt 0 0.024766 0\nvt 1 0.024766 0\nvt 0.919738 0.024766 0\nvt 0.946492 0.024766 0\nvt 0.973246 0.024766 0\nvt 0 0.024766 0\nvt 1 0.024766 0\nvt 0.919738 0.024766 0\nvt 0.946492 0.024766 0\nvt 0.973246 0.024766 0\nvt 1 0.049533 0\nvt 0 0.049533 0\nvt 0.919738 0.049533 0\nvt 0.946492 0.049533 0\nvt 0.973246 0.049533 0\nvt 0 0.049533 0\nvt 1 0.049533 0\nvt 0.919738 0.049533 0\nvt 0.946492 0.049533 0\nvt 0.973246 0.049533 0\nvt 0 0.049533 0\nvt 1 0.049533 0\nvt 0.919738 0.049533 0\nvt 0.946492 0.049533 0\nvt 0.973246 0.049533 0\nvt 0 0.049533 0\nvt 1 0.049533 0\nvt 0.919738 0.049533 0\nvt 0.946492 0.049533 0\nvt 0.973246 0.049533 0\nvt 1 0.074299 0\nvt 0 0.074299 0\nvt 0.919738 0.074299 0\nvt 0.946492 0.074299 0\nvt 0.973246 0.074299 0\nvt 0 0.074299 0\nvt 1 0.074299 0\nvt 0.919738 0.074299 0\nvt 0.946492 0.074299 0\nvt 0.973246 0.074299 0\nvt 0 0.074299 0\nvt 1 0.074299 0\nvt 0.919738 0.074299 0\nvt 0.946492 0.074299 0\nvt 0.973246 0.074299 0\nvt 0 0.074299 0\nvt 1 0.074299 0\nvt 0.919738 0.074299 0\nvt 0.946492 0.074299 0\nvt 0.973246 0.074299 0\nvt 1 0.925701 0\nvt 0 0.925701 0\nvt 0.919738 0.925701 0\nvt 0.946492 0.925701 0\nvt 0.973246 0.925701 0\nvt 0 0.925701 0\nvt 1 0.925701 0\nvt 0.919738 0.925701 0\nvt 0.946492 0.925701 0\nvt 0.973246 0.925701 0\nvt 0 0.925701 0\nvt 1 0.925701 0\nvt 0.919738 0.925701 0\nvt 0.946492 0.925701 0\nvt 0.973246 0.925701 0\nvt 0 0.925701 0\nvt 1 0.925701 0\nvt 0.919738 0.925701 0\nvt 0.946492 0.925701 0\nvt 0.973246 0.925701 0\nvt 1 0.950467 0\nvt 0 0.950467 0\nvt 0.919738 0.950467 0\nvt 0.946492 0.950467 0\nvt 0.973246 0.950467 0\nvt 0 0.950467 0\nvt 1 0.950467 0\nvt 0.919738 0.950467 0\nvt 0.946492 0.950467 0\nvt 0.973246 0.950467 0\nvt 0 0.950467 0\nvt 1 0.950467 0\nvt 0.919738 0.950467 0\nvt 0.946492 0.950467 0\nvt 0.973246 0.950467 0\nvt 0 0.950467 0\nvt 1 0.950467 0\nvt 0.919738 0.950467 0\nvt 0.946492 0.950467 0\nvt 0.973246 0.950467 0\nvt 1 0.975234 0\nvt 0 0.975234 0\nvt 0.919738 0.975234 0\nvt 0.946492 0.975234 0\nvt 0.973246 0.975234 0\nvt 0 0.975234 0\nvt 1 0.975234 0\nvt 0.919738 0.975234 0\nvt 0.946492 0.975234 0\nvt 0.973246 0.975234 0\nvt 0 0.975234 0\nvt 1 0.975234 0\nvt 0.919738 0.975234 0\nvt 0.946492 0.975234 0\nvt 0.973246 0.975234 0\nvt 0 0.975234 0\nvt 1 0.975234 0\nvt 0.919738 0.975234 0\nvt 0.946492 0.975234 0\nvt 0.973246 0.975234 0\nvt 0.959869 1 0\nvt 0.933115 1 0\nvt 0.919738 1 0\nvt 0 1 0\nvt 0.986623 1 0\nvt 0 1 0\nvt 0.986623 1 0\nvt 0.959869 1 0\nvt 0.933115 1 0\nvt 0.919738 1 0\nvt 0 1 0\nvt 0.986623 1 0\nvt 0.959869 1 0\nvt 0.933115 1 0\nvt 0.919738 1 0\nvt 0 1 0\nvt 0.986623 1 0\nvt 0.959869 1 0\nvt 0.933115 1 0\nvt 0.919738 1 0\n\nf 2/12 6/26 5/25 1/6 \nf 6/26 22/46 21/45 5/25 \nf 22/46 38/66 37/65 21/45 \nf 85/124 101/148 100/143 \nf 54/86 70/106 69/105 53/85 \nf 70/106 86/126 85/125 69/105 \nf 86/126 102/153 101/147 85/125 \nf 7/27 6/26 2/11 \nf 7/27 23/47 22/46 6/26 \nf 23/47 39/67 38/66 22/46 \nf 39/67 55/87 54/86 38/66 \nf 55/87 71/107 70/106 54/86 \nf 71/107 87/127 86/126 70/106 \nf 87/127 102/152 86/126 \nf 8/28 7/27 2/10 \nf 8/28 24/48 23/47 7/27 \nf 24/48 40/68 39/67 23/47 \nf 40/68 56/88 55/87 39/67 \nf 56/88 72/108 71/107 55/87 \nf 72/108 88/128 87/127 71/107 \nf 88/128 102/151 87/127 \nf 9/30 8/28 2/9 \nf 9/30 25/50 24/48 8/28 \nf 25/50 41/70 40/68 24/48 \nf 41/70 57/90 56/88 40/68 \nf 57/90 73/110 72/108 56/88 \nf 73/110 89/130 88/128 72/108 \nf 89/130 102/150 88/128 \nf 3/18 10/31 9/29 2/8 \nf 10/31 26/51 25/49 9/29 \nf 26/51 42/71 41/69 25/49 \nf 4/19 3/17 2/7 1/5 \nf 58/91 74/111 73/109 57/89 \nf 74/111 90/131 89/129 73/109 \nf 90/131 103/158 102/149 89/129 \nf 11/32 10/31 3/16 \nf 11/32 27/52 26/51 10/31 \nf 27/52 43/72 42/71 26/51 \nf 43/72 59/92 58/91 42/71 \nf 59/92 75/112 74/111 58/91 \nf 75/112 91/132 90/131 74/111 \nf 91/132 103/157 90/131 \nf 12/33 11/32 3/15 \nf 12/33 28/53 27/52 11/32 \nf 28/53 44/73 43/72 27/52 \nf 44/73 60/93 59/92 43/72 \nf 60/93 76/113 75/112 59/92 \nf 76/113 92/133 91/132 75/112 \nf 92/133 103/156 91/132 \nf 13/35 12/33 3/14 \nf 13/35 29/55 28/53 12/33 \nf 29/55 45/75 44/73 28/53 \nf 45/75 61/95 60/93 44/73 \nf 61/95 77/115 76/113 60/93 \nf 77/115 93/135 92/133 76/113 \nf 93/135 103/155 92/133 \nf 4/23 14/36 13/34 3/13 \nf 14/36 30/56 29/54 13/34 \nf 30/56 46/76 45/74 29/54 \nf 46/76 62/96 61/94 45/74 \nf 62/96 78/116 77/114 61/94 \nf 78/116 94/136 93/134 77/114 \nf 94/136 104/163 103/154 93/134 \nf 15/37 14/36 4/22 \nf 15/37 31/57 30/56 14/36 \nf 31/57 47/77 46/76 30/56 \nf 47/77 63/97 62/96 46/76 \nf 63/97 79/117 78/116 62/96 \nf 79/117 95/137 94/136 78/116 \nf 95/137 104/162 94/136 \nf 16/38 15/37 4/21 \nf 16/38 32/58 31/57 15/37 \nf 32/58 48/78 47/77 31/57 \nf 48/78 64/98 63/97 47/77 \nf 64/98 80/118 79/117 63/97 \nf 80/118 96/138 95/137 79/117 \nf 96/138 104/161 95/137 \nf 17/40 16/38 4/20 \nf 17/40 33/60 32/58 16/38 \nf 33/60 49/80 48/78 32/58 \nf 49/80 65/100 64/98 48/78 \nf 65/100 81/120 80/118 64/98 \nf 81/120 97/140 96/138 80/118 \nf 97/140 104/160 96/138 \nf 1/4 18/41 17/39 4/19 \nf 18/41 34/61 33/59 17/39 \nf 34/61 50/81 49/79 33/59 \nf 50/81 66/101 65/99 49/79 \nf 66/101 82/121 81/119 65/99 \nf 82/121 98/141 97/139 81/119 \nf 98/141 101/146 104/159 97/139 \nf 19/42 18/41 1/3 \nf 19/42 35/62 34/61 18/41 \nf 35/62 51/82 50/81 34/61 \nf 51/82 67/102 66/101 50/81 \nf 67/102 83/122 82/121 66/101 \nf 83/122 99/142 98/141 82/121 \nf 99/142 101/145 98/141 \nf 20/43 19/42 1/2 \nf 20/43 36/63 35/62 19/42 \nf 36/63 52/83 51/82 35/62 \nf 52/83 68/103 67/102 51/82 \nf 68/103 84/123 83/122 67/102 \nf 84/123 100/143 99/142 83/122 \nf 100/143 101/144 99/142 \nf 5/24 20/43 1/1 \nf 5/24 21/44 36/63 20/43 \nf 21/44 37/64 52/83 36/63 \nf 37/64 53/84 68/103 52/83 \nf 53/84 69/104 84/123 68/103 \nf 69/104 85/124 100/143 84/123 \n\n'
        );
        J3DI.setFileData('lib/models/pocketcubes4/corner_r.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng corner_r corner_f\nusemtl Stickers\nv 2 0.1 1.9\nv 2 1.9 1.9\nv 2 0.1 0.1\nv 2 1.9 0.1\nv 1.8 0.1 0.1\nv 1.8 1.9 0.1\nv 1.8 0.1 1.9\nv 1.8 1.9 1.9\n\nvt 0.05 0.05 0.05\nvt 0.05 0.95 0.05\nvt 0.95 0.05 0.05\nvt 0.95 0.95 0.05\n\nf 3/3 4/4 2/2 1/1 \n\n'
        );
        J3DI.setFileData('lib/models/pocketcubes4/corner_u.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng corner_u corner_f\nusemtl Stickers\nv 0.1 2 1.9\nv 0.1 2 0.1\nv 1.9 2 1.9\nv 1.9 2 0.1\nv 1.9 1.8 1.9\nv 1.9 1.8 0.1\nv 0.1 1.8 1.9\nv 0.1 1.8 0.1\n\nvt 0.05 0.05 0.05\nvt 0.05 0.95 0.05\nvt 0.95 0.05 0.05\nvt 0.95 0.95 0.05\n\nf 3/3 4/4 2/2 1/1 \n\n'
        );
        J3DI.setFileData('lib/models/pocketcubes4/corner_f.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng corner_f\nusemtl Stickers\nv 0.1 0.1 2\nv 0.1 1.9 2\nv 1.9 0.1 2\nv 1.9 1.9 2\nv 1.9 0.1 1.8\nv 1.9 1.9 1.8\nv 0.1 0.1 1.8\nv 0.1 1.9 1.8\n\nvt 0.05 0.05 0.05\nvt 0.05 0.95 0.05\nvt 0.95 0.05 0.05\nvt 0.95 0.95 0.05\n\nf 3/3 4/4 2/2 1/1 \n\n'
        );
        J3DI.setFileData('lib/models/pocketcubes4/center.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng center centerCube Face_1\nv -0.3 -0.3 0.3\nv -0.3 0.3 0.3\nv 0.3 -0.3 0.3\nv 0.3 0.3 0.3\n\nvt 0 0 0\nvt 0 1 0\nvt 1 0 0\nvt 1 1 0\n\nf 3/3 4/4 2/2 1/1 \n\ng center centerCube Face_2\nv 0.3 -0.3 0.3\nv 0.3 0.3 0.3\nv 0.3 -0.3 -0.3\nv 0.3 0.3 -0.3\n\nvt 0 0 0\nvt 0 1 0\nvt 1 0 0\nvt 1 1 0\n\nf 7/7 8/8 6/6 5/5 \n\ng center centerCube Face_3\nv 0.3 -0.3 -0.3\nv 0.3 0.3 -0.3\nv -0.3 -0.3 -0.3\nv -0.3 0.3 -0.3\n\nvt 0 0 0\nvt 0 1 0\nvt 1 0 0\nvt 1 1 0\n\nf 11/11 12/12 10/10 9/9 \n\ng center centerCube Face_4\nv -0.3 -0.3 -0.3\nv -0.3 0.3 -0.3\nv -0.3 -0.3 0.3\nv -0.3 0.3 0.3\n\nvt 0 0 0\nvt 0 1 0\nvt 1 0 0\nvt 1 1 0\n\nf 15/15 16/16 14/14 13/13 \n\ng center centerCube Face_5\nv -0.3 0.3 0.3\nv -0.3 0.3 -0.3\nv 0.3 0.3 0.3\nv 0.3 0.3 -0.3\n\nvt 0 0 0\nvt 0 1 0\nvt 1 0 0\nvt 1 1 0\n\nf 19/19 20/20 18/18 17/17 \n\ng center centerCube Face_6\nv -0.3 -0.3 -0.3\nv -0.3 -0.3 0.3\nv 0.3 -0.3 -0.3\nv 0.3 -0.3 0.3\n\nvt 0 0 0\nvt 0 1 0\nvt 1 0 0\nvt 1 1 0\n\nf 23/23 24/24 22/22 21/21 \n\ng center Instance1\nv 0.9 -0.173205 0.1\nv 0.9 -0.173205 0.1\nv -0.9 -0.2 0\nv -0.9 -0.2 0\nv -0.3 -0.2 0\nv 0.3 -0.2 0\nv 0.9 -0.2 0\nv 0.9 -0.2 0\nv -0.9 -0.173205 -0.1\nv -0.9 -0.173205 -0.1\nv -0.3 -0.173205 -0.1\nv 0.3 -0.173205 -0.1\nv 0.9 -0.173205 -0.1\nv 0.9 -0.173205 -0.1\nv -0.9 -0.1 -0.173205\nv -0.9 -0.1 -0.173205\nv -0.3 -0.1 -0.173205\nv 0.3 -0.1 -0.173205\nv 0.9 -0.1 -0.173205\nv 0.9 -0.1 -0.173205\nv -0.9 0 -0.2\nv -0.9 0 -0.2\nv -0.3 0 -0.2\nv 0.3 0 -0.2\nv 0.9 0 -0.2\nv 0.9 0 -0.2\nv -0.9 0.1 -0.173205\nv -0.9 0.1 -0.173205\nv -0.3 0.1 -0.173205\nv 0.3 0.1 -0.173205\nv 0.9 0.1 -0.173205\nv 0.9 0.1 -0.173205\nv -0.9 0.173205 -0.1\nv -0.9 0.173205 -0.1\nv -0.3 0.173205 -0.1\nv 0.3 0.173205 -0.1\nv 0.9 0.173205 -0.1\nv 0.9 0.173205 -0.1\nv -0.9 0.2 0\nv -0.9 0.2 0\nv -0.3 0.2 0\nv 0.3 0.2 0\nv 0.9 0.2 0\nv 0.9 0.2 0\nv -0.9 0.173205 0.1\nv -0.9 0.173205 0.1\nv -0.3 0.173205 0.1\nv 0.3 0.173205 0.1\nv 0.9 0.173205 0.1\nv 0.9 0.173205 0.1\nv -0.9 0.1 0.173205\nv -0.9 0.1 0.173205\nv -0.3 0.1 0.173205\nv 0.3 0.1 0.173205\nv 0.9 0.1 0.173205\nv 0.9 0.1 0.173205\nv -0.9 0 0.2\nv -0.9 0 0.2\nv -0.3 0 0.2\nv 0.3 0 0.2\nv 0.9 0 0.2\nv 0.9 0 0.2\nv -0.9 -0.1 0.173205\nv -0.9 -0.1 0.173205\nv -0.3 -0.1 0.173205\nv 0.3 -0.1 0.173205\nv 0.9 -0.1 0.173205\nv 0.9 -0.1 0.173205\nv -0.9 -0.173205 0.1\nv -0.9 -0.173205 0.1\nv -0.3 -0.173205 0.1\nv 0.3 -0.173205 0.1\n\nvt 0.933013 0.25 0\nvt 0.916667 1 0\nvt 0 0.5 0\nvt 1 0 0\nvt 0 0 0\nvt 1 0.333333 0\nvt 0 0.333333 0\nvt 1 0.666667 0\nvt 0 0.666667 0\nvt 1 1 0\nvt 0 1 0\nvt 1 0.5 0\nvt 0.066987 0.75 0\nvt 0.083333 0 0\nvt 0.083333 0.333333 0\nvt 0.083333 0.666667 0\nvt 0.083333 1 0\nvt 0.933013 0.75 0\nvt 0.25 0.933013 0\nvt 0.166667 0 0\nvt 0.166667 0.333333 0\nvt 0.166667 0.666667 0\nvt 0.166667 1 0\nvt 0.75 0.933013 0\nvt 0.5 1 0\nvt 0.25 0 0\nvt 0.25 0.333333 0\nvt 0.25 0.666667 0\nvt 0.25 1 0\nvt 0.5 1 0\nvt 0.75 0.933013 0\nvt 0.333333 0 0\nvt 0.333333 0.333333 0\nvt 0.333333 0.666667 0\nvt 0.333333 1 0\nvt 0.25 0.933013 0\nvt 0.933013 0.75 0\nvt 0.416667 0 0\nvt 0.416667 0.333333 0\nvt 0.416667 0.666667 0\nvt 0.416667 1 0\nvt 0.066987 0.75 0\nvt 1 0.5 0\nvt 0.5 0 0\nvt 0.5 0.333333 0\nvt 0.5 0.666667 0\nvt 0.5 1 0\nvt 0 0.5 0\nvt 0.933013 0.25 0\nvt 0.583333 0 0\nvt 0.583333 0.333333 0\nvt 0.583333 0.666667 0\nvt 0.583333 1 0\nvt 0.066987 0.25 0\nvt 0.75 0.066987 0\nvt 0.666667 0 0\nvt 0.666667 0.333333 0\nvt 0.666667 0.666667 0\nvt 0.666667 1 0\nvt 0.25 0.066987 0\nvt 0.5 0 0\nvt 0.75 0 0\nvt 0.75 0.333333 0\nvt 0.75 0.666667 0\nvt 0.75 1 0\nvt 0.5 0 0\nvt 0.25 0.066987 0\nvt 0.833333 0 0\nvt 0.833333 0.333333 0\nvt 0.833333 0.666667 0\nvt 0.833333 1 0\nvt 0.75 0.066987 0\nvt 0.066987 0.25 0\nvt 0.916667 0 0\nvt 0.916667 0.333333 0\nvt 0.916667 0.666667 0\n\nf 75/79 69/73 63/67 57/61 51/55 45/49 39/43 33/37 27/27 93/97 87/91 81/85 \nf 38/42 44/48 50/54 56/60 62/66 68/72 74/78 80/84 86/90 92/96 25/25 32/36 \nf 34/38 35/39 29/31 28/29 \nf 36/40 37/41 31/35 30/33 \nf 40/44 41/45 35/39 34/38 \nf 42/46 43/47 37/41 36/40 \nf 46/50 47/51 41/45 40/44 \nf 94/98 95/99 89/93 88/92 \nf 48/52 49/53 43/47 42/46 \nf 52/56 53/57 47/51 46/50 \nf 54/58 55/59 49/53 48/52 \nf 58/62 59/63 53/57 52/56 \nf 96/100 26/26 91/95 90/94 \nf 60/64 61/65 55/59 54/58 \nf 76/80 77/81 71/75 70/74 \nf 90/94 91/95 85/89 84/88 \nf 64/68 65/69 59/63 58/62 \nf 28/28 29/30 95/99 94/98 \nf 66/70 67/71 61/65 60/64 \nf 78/82 79/83 73/77 72/76 \nf 84/88 85/89 79/83 78/82 \nf 70/74 71/75 65/69 64/68 \nf 30/32 31/34 26/26 96/100 \nf 72/76 73/77 67/71 66/70 \nf 82/86 83/87 77/81 76/80 \nf 88/92 89/93 83/87 82/86 \n\ng center Instance\nv 0.173205 -0.1 0.9\nv 0.173205 -0.1 0.9\nv 0.2 0 -0.9\nv 0.2 0 -0.9\nv 0.2 0 -0.3\nv 0.2 0 0.3\nv 0.2 0 0.9\nv 0.2 0 0.9\nv 0.173205 0.1 -0.9\nv 0.173205 0.1 -0.9\nv 0.173205 0.1 -0.3\nv 0.173205 0.1 0.3\nv 0.173205 0.1 0.9\nv 0.173205 0.1 0.9\nv 0.1 0.173205 -0.9\nv 0.1 0.173205 -0.9\nv 0.1 0.173205 -0.3\nv 0.1 0.173205 0.3\nv 0.1 0.173205 0.9\nv 0.1 0.173205 0.9\nv 0 0.2 -0.9\nv 0 0.2 -0.9\nv 0 0.2 -0.3\nv 0 0.2 0.3\nv 0 0.2 0.9\nv 0 0.2 0.9\nv -0.1 0.173205 -0.9\nv -0.1 0.173205 -0.9\nv -0.1 0.173205 -0.3\nv -0.1 0.173205 0.3\nv -0.1 0.173205 0.9\nv -0.1 0.173205 0.9\nv -0.173205 0.1 -0.9\nv -0.173205 0.1 -0.9\nv -0.173205 0.1 -0.3\nv -0.173205 0.1 0.3\nv -0.173205 0.1 0.9\nv -0.173205 0.1 0.9\nv -0.2 0 -0.9\nv -0.2 0 -0.9\nv -0.2 0 -0.3\nv -0.2 0 0.3\nv -0.2 0 0.9\nv -0.2 0 0.9\nv -0.173205 -0.1 -0.9\nv -0.173205 -0.1 -0.9\nv -0.173205 -0.1 -0.3\nv -0.173205 -0.1 0.3\nv -0.173205 -0.1 0.9\nv -0.173205 -0.1 0.9\nv -0.1 -0.173205 -0.9\nv -0.1 -0.173205 -0.9\nv -0.1 -0.173205 -0.3\nv -0.1 -0.173205 0.3\nv -0.1 -0.173205 0.9\nv -0.1 -0.173205 0.9\nv 0 -0.2 -0.9\nv 0 -0.2 -0.9\nv 0 -0.2 -0.3\nv 0 -0.2 0.3\nv 0 -0.2 0.9\nv 0 -0.2 0.9\nv 0.1 -0.173205 -0.9\nv 0.1 -0.173205 -0.9\nv 0.1 -0.173205 -0.3\nv 0.1 -0.173205 0.3\nv 0.1 -0.173205 0.9\nv 0.1 -0.173205 0.9\nv 0.173205 -0.1 -0.9\nv 0.173205 -0.1 -0.9\nv 0.173205 -0.1 -0.3\nv 0.173205 -0.1 0.3\n\nvt 0.916667 1 0\nvt 0.933013 0.75 0\nvt 0 0.5 0\nvt 1 0 0\nvt 0 0 0\nvt 1 0.333333 0\nvt 0 0.333333 0\nvt 1 0.666667 0\nvt 0 0.666667 0\nvt 1 1 0\nvt 0 1 0\nvt 1 0.5 0\nvt 0.066987 0.75 0\nvt 0.083333 0 0\nvt 0.083333 0.333333 0\nvt 0.083333 0.666667 0\nvt 0.083333 1 0\nvt 0.933013 0.75 0\nvt 0.25 0.933013 0\nvt 0.166667 0 0\nvt 0.166667 0.333333 0\nvt 0.166667 0.666667 0\nvt 0.166667 1 0\nvt 0.75 0.933013 0\nvt 0.5 1 0\nvt 0.25 0 0\nvt 0.25 0.333333 0\nvt 0.25 0.666667 0\nvt 0.25 1 0\nvt 0.5 1 0\nvt 0.75 0.933013 0\nvt 0.333333 0 0\nvt 0.333333 0.333333 0\nvt 0.333333 0.666667 0\nvt 0.333333 1 0\nvt 0.25 0.933013 0\nvt 0.933013 0.75 0\nvt 0.416667 0 0\nvt 0.416667 0.333333 0\nvt 0.416667 0.666667 0\nvt 0.416667 1 0\nvt 0.066987 0.75 0\nvt 1 0.5 0\nvt 0.5 0 0\nvt 0.5 0.333333 0\nvt 0.5 0.666667 0\nvt 0.5 1 0\nvt 0 0.5 0\nvt 0.933013 0.25 0\nvt 0.583333 0 0\nvt 0.583333 0.333333 0\nvt 0.583333 0.666667 0\nvt 0.583333 1 0\nvt 0.066987 0.25 0\nvt 0.75 0.066987 0\nvt 0.666667 0 0\nvt 0.666667 0.333333 0\nvt 0.666667 0.666667 0\nvt 0.666667 1 0\nvt 0.25 0.066987 0\nvt 0.5 0 0\nvt 0.75 0 0\nvt 0.75 0.333333 0\nvt 0.75 0.666667 0\nvt 0.75 1 0\nvt 0.5 0 0\nvt 0.25 0.066987 0\nvt 0.833333 0 0\nvt 0.833333 0.333333 0\nvt 0.833333 0.666667 0\nvt 0.833333 1 0\nvt 0.75 0.066987 0\nvt 0.066987 0.25 0\nvt 0.916667 0 0\nvt 0.916667 0.333333 0\nvt 0.916667 0.666667 0\n\nf 110/118 116/124 122/130 128/136 134/142 140/148 146/154 152/160 158/166 164/172 98/102 104/112 \nf 147/155 141/149 135/143 129/137 123/131 117/125 111/119 105/113 99/103 165/173 159/167 153/161 \nf 106/114 107/115 101/107 100/105 \nf 108/116 109/117 103/111 102/109 \nf 112/120 113/121 107/115 106/114 \nf 114/122 115/123 109/117 108/116 \nf 118/126 119/127 113/121 112/120 \nf 100/104 101/106 167/175 166/174 \nf 120/128 121/129 115/123 114/122 \nf 124/132 125/133 119/127 118/126 \nf 102/108 103/110 97/101 168/176 \nf 126/134 127/135 121/129 120/128 \nf 130/138 131/139 125/133 124/132 \nf 132/140 133/141 127/135 126/134 \nf 168/176 97/101 163/171 162/170 \nf 148/156 149/157 143/151 142/150 \nf 136/144 137/145 131/139 130/138 \nf 160/168 161/169 155/163 154/162 \nf 138/146 139/147 133/141 132/140 \nf 156/164 157/165 151/159 150/158 \nf 150/158 151/159 145/153 144/152 \nf 142/150 143/151 137/145 136/144 \nf 166/174 167/175 161/169 160/168 \nf 144/152 145/153 139/147 138/146 \nf 162/170 163/171 157/165 156/164 \nf 154/162 155/163 149/157 148/156 \n\ng center centerCylinder\nv 0.173205 0.9 0.1\nv 0.173205 0.9 0.1\nv 0.2 -0.9 0\nv 0.2 -0.9 0\nv 0.2 -0.3 0\nv 0.2 0.3 0\nv 0.2 0.9 0\nv 0.2 0.9 0\nv 0.173205 -0.9 -0.1\nv 0.173205 -0.9 -0.1\nv 0.173205 -0.3 -0.1\nv 0.173205 0.3 -0.1\nv 0.173205 0.9 -0.1\nv 0.173205 0.9 -0.1\nv 0.1 -0.9 -0.173205\nv 0.1 -0.9 -0.173205\nv 0.1 -0.3 -0.173205\nv 0.1 0.3 -0.173205\nv 0.1 0.9 -0.173205\nv 0.1 0.9 -0.173205\nv 0 -0.9 -0.2\nv 0 -0.9 -0.2\nv 0 -0.3 -0.2\nv 0 0.3 -0.2\nv 0 0.9 -0.2\nv 0 0.9 -0.2\nv -0.1 -0.9 -0.173205\nv -0.1 -0.9 -0.173205\nv -0.1 -0.3 -0.173205\nv -0.1 0.3 -0.173205\nv -0.1 0.9 -0.173205\nv -0.1 0.9 -0.173205\nv -0.173205 -0.9 -0.1\nv -0.173205 -0.9 -0.1\nv -0.173205 -0.3 -0.1\nv -0.173205 0.3 -0.1\nv -0.173205 0.9 -0.1\nv -0.173205 0.9 -0.1\nv -0.2 -0.9 0\nv -0.2 -0.9 0\nv -0.2 -0.3 0\nv -0.2 0.3 0\nv -0.2 0.9 0\nv -0.2 0.9 0\nv -0.173205 -0.9 0.1\nv -0.173205 -0.9 0.1\nv -0.173205 -0.3 0.1\nv -0.173205 0.3 0.1\nv -0.173205 0.9 0.1\nv -0.173205 0.9 0.1\nv -0.1 -0.9 0.173205\nv -0.1 -0.9 0.173205\nv -0.1 -0.3 0.173205\nv -0.1 0.3 0.173205\nv -0.1 0.9 0.173205\nv -0.1 0.9 0.173205\nv 0 -0.9 0.2\nv 0 -0.9 0.2\nv 0 -0.3 0.2\nv 0 0.3 0.2\nv 0 0.9 0.2\nv 0 0.9 0.2\nv 0.1 -0.9 0.173205\nv 0.1 -0.9 0.173205\nv 0.1 -0.3 0.173205\nv 0.1 0.3 0.173205\nv 0.1 0.9 0.173205\nv 0.1 0.9 0.173205\nv 0.173205 -0.9 0.1\nv 0.173205 -0.9 0.1\nv 0.173205 -0.3 0.1\nv 0.173205 0.3 0.1\n\nvt 0.916667 1 0\nvt 0.933013 0.75 0\nvt 0 0.5 0\nvt 1 0 0\nvt 0 0 0\nvt 1 0.333333 0\nvt 0 0.333333 0\nvt 1 0.666667 0\nvt 0 0.666667 0\nvt 1 1 0\nvt 0 1 0\nvt 1 0.5 0\nvt 0.066987 0.75 0\nvt 0.083333 0 0\nvt 0.083333 0.333333 0\nvt 0.083333 0.666667 0\nvt 0.083333 1 0\nvt 0.933013 0.75 0\nvt 0.25 0.933013 0\nvt 0.166667 0 0\nvt 0.166667 0.333333 0\nvt 0.166667 0.666667 0\nvt 0.166667 1 0\nvt 0.75 0.933013 0\nvt 0.5 1 0\nvt 0.25 0 0\nvt 0.25 0.333333 0\nvt 0.25 0.666667 0\nvt 0.25 1 0\nvt 0.5 1 0\nvt 0.75 0.933013 0\nvt 0.333333 0 0\nvt 0.333333 0.333333 0\nvt 0.333333 0.666667 0\nvt 0.333333 1 0\nvt 0.25 0.933013 0\nvt 0.933013 0.75 0\nvt 0.416667 0 0\nvt 0.416667 0.333333 0\nvt 0.416667 0.666667 0\nvt 0.416667 1 0\nvt 0.066987 0.75 0\nvt 1 0.5 0\nvt 0.5 0 0\nvt 0.5 0.333333 0\nvt 0.5 0.666667 0\nvt 0.5 1 0\nvt 0 0.5 0\nvt 0.933013 0.25 0\nvt 0.583333 0 0\nvt 0.583333 0.333333 0\nvt 0.583333 0.666667 0\nvt 0.583333 1 0\nvt 0.066987 0.25 0\nvt 0.75 0.066987 0\nvt 0.666667 0 0\nvt 0.666667 0.333333 0\nvt 0.666667 0.666667 0\nvt 0.666667 1 0\nvt 0.25 0.066987 0\nvt 0.5 0 0\nvt 0.75 0 0\nvt 0.75 0.333333 0\nvt 0.75 0.666667 0\nvt 0.75 1 0\nvt 0.5 0 0\nvt 0.25 0.066987 0\nvt 0.833333 0 0\nvt 0.833333 0.333333 0\nvt 0.833333 0.666667 0\nvt 0.833333 1 0\nvt 0.75 0.066987 0\nvt 0.066987 0.25 0\nvt 0.916667 0 0\nvt 0.916667 0.333333 0\nvt 0.916667 0.666667 0\n\nf 236/248 170/178 176/188 182/194 188/200 194/206 200/212 206/218 212/224 218/230 224/236 230/242 \nf 219/231 213/225 207/219 201/213 195/207 189/201 183/195 177/189 171/179 237/249 231/243 225/237 \nf 178/190 179/191 173/183 172/181 \nf 234/246 235/247 229/241 228/240 \nf 180/192 181/193 175/187 174/185 \nf 184/196 185/197 179/191 178/190 \nf 186/198 187/199 181/193 180/192 \nf 190/202 191/203 185/197 184/196 \nf 192/204 193/205 187/199 186/198 \nf 196/208 197/209 191/203 190/202 \nf 198/210 199/211 193/205 192/204 \nf 202/214 203/215 197/209 196/208 \nf 172/180 173/182 239/251 238/250 \nf 204/216 205/217 199/211 198/210 \nf 238/250 239/251 233/245 232/244 \nf 220/232 221/233 215/227 214/226 \nf 208/220 209/221 203/215 202/214 \nf 232/244 233/245 227/239 226/238 \nf 210/222 211/223 205/217 204/216 \nf 228/240 229/241 223/235 222/234 \nf 222/234 223/235 217/229 216/228 \nf 214/226 215/227 209/221 208/220 \nf 174/184 175/186 169/177 240/252 \nf 216/228 217/229 211/223 210/222 \nf 240/252 169/177 235/247 234/246 \nf 226/238 227/239 221/233 220/232 \n\n'
        );
        return { };
      });
    'use strict';
    define('PreloadRubiksCubeS1', ['J3DI'],
      function (J3DI) {
        J3DI.setFileData('lib/models/rubikscubes1/corner.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng Boole Cube\nv 1.005 0.905 2.595\nv 2.595 0.905 2.595\nv 2.595 0.905 1.005\nv 1.005 1.005 2.695\nv 2.595 1.005 2.695\nv 2.695 1.005 2.595\nv 2.695 1.005 1.005\nv 2.595 1.005 0.905\nv 0.905 1.005 2.595\nv 1.005 2.595 2.695\nv 2.595 2.595 2.695\nv 2.695 2.595 2.595\nv 2.695 2.595 1.005\nv 2.595 2.595 0.905\nv 1.005 2.595 0.905\nv 0.905 2.595 1.005\nv 0.905 2.595 2.595\nv 1.005 2.695 2.595\nv 2.595 2.695 2.595\nv 2.595 2.695 1.005\nv 1.005 2.695 1.005\nv 1.35 1.005 0.905\nv 1.35 0.905 1.005\nv 0.905 1.35 1.005\nv 1.005 1.35 0.905\nv 1.005 0.905 1.35\nv 0.905 1.35 1.35\nv 0.905 1.005 1.35\nv 1.35 1.35 0.905\nv 1.35 0.905 1.35\n\nvt 0.955045 0 0\nvt 0.91009 0 0\nvt 0 1 0\nvt 0 0 0\nvt 1 1 0\nvt 0 0 0\nvt 0.955045 0 0\nvt 0.91009 0 0\nvt 0 0 0\nvt 0.955045 0 0\nvt 1 0 0\nvt 0.91009 0 0\nvt 1 0.082493 0\nvt 0 0.082493 0\nvt 0.91009 0.082493 0\nvt 0 0.082493 0\nvt 1 0.082493 0\nvt 0.91009 0.082493 0\nvt 0 0.082493 0\nvt 1 0.082493 0\nvt 0.91009 0.082493 0\nvt 1 0.917507 0\nvt 0 0.917507 0\nvt 0.91009 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.91009 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.91009 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.91009 0.917507 0\nvt 0.955045 1 0\nvt 0.91009 1 0\nvt 0 1 0\nvt 0 1 0\nvt 0.955045 1 0\nvt 0.91009 1 0\nvt 0 1 0\nvt 0.955045 1 0\nvt 0.91009 1 0\nvt 0 1 0\nvt 0.955045 1 0\nvt 0.91009 1 0\nvt 0.712618 0.082493 0\nvt 0.712618 0 0\nvt 0.216981 0 0\nvt 0 0.263675 0\nvt 1 0.263675 0\nvt 0.91009 0.263675 0\nvt 0.197472 0 0\nvt 0 0.216981 0\nvt 0.197472 0.263675 0\nvt 0.197472 0.082493 0\nvt 0.712618 0.263675 0\nvt 0.216981 0.216981 0\n\nf 2/8 5/15 4/14 1/4 \nf 30/57 2/5 1/3 26/53 \nf 11/24 19/39 18/36 10/23 \nf 6/17 5/15 2/7 \nf 6/17 12/26 11/24 5/15 \nf 12/26 19/38 11/24 \nf 3/12 7/18 6/16 2/6 \nf 30/57 23/48 3/11 2/5 \nf 13/27 20/42 19/37 12/25 \nf 8/20 7/18 3/10 \nf 8/20 14/29 13/27 7/18 \nf 14/29 20/41 13/27 \nf 22/46 8/19 3/9 23/47 \nf 29/56 14/28 8/19 22/46 \nf 29/56 25/51 15/30 14/28 \nf 15/30 21/45 20/40 14/28 \nf 24/50 16/32 15/30 25/51 \nf 16/32 21/44 15/30 \nf 9/21 28/55 26/52 1/2 \nf 24/49 27/54 17/33 16/31 \nf 27/54 28/55 9/21 17/33 \nf 17/33 18/35 21/43 16/31 \nf 4/13 9/21 1/1 \nf 4/13 10/22 17/33 9/21 \nf 10/22 18/34 17/33 \n\ng Boole Cube_1\nv 0.45 0.45 1.35\nv 0.45 1.35 1.35\nv 1.35 0.45 1.35\nv 1.35 0.45 0.45\nv 1.35 1.35 0.45\nv 0.45 0.45 0.45\nv 0.45 1.35 0.45\nv 0.905 1.35 1.35\nv 1.35 1.35 0.905\nv 1.35 0.905 1.35\nv 1.35 1.005 0.905\nv 1.35 0.905 1.005\nv 1.005 1.35 0.905\nv 1.005 0.905 1.35\nv 0.905 1.005 1.35\nv 0.905 1.35 1.005\n\nvt 0 1 0\nvt 1 0 0\nvt 0 0 0\nvt 0 0 0\nvt 1 1 0\nvt 0 1 0\nvt 1 1 0\nvt 0 0 0\nvt 1 0 0\nvt 1 0 0\nvt 0 0 0\nvt 1 1 0\nvt 0 1 0\nvt 0 0 0\nvt 1 0 0\nvt 0 1 0\nvt 1 1 0\nvt 0.505556 0 0\nvt 0.505556 1 0\nvt 1 0.494444 0\nvt 0.494444 1 0\nvt 0 0.505556 0\nvt 1 0.505556 0\nvt 0.494444 0.616667 0\nvt 0.383333 0.505556 0\nvt 0.616667 0.494444 0\nvt 0.616667 0.505556 0\nvt 0.505556 0.616667 0\nvt 0.505556 0.383333 0\n\nf 44/84 33/66 40/80 \nf 45/85 38/76 32/63 31/60 \nf 44/84 45/85 31/60 33/66 \nf 41/81 35/69 39/78 \nf 34/67 42/82 40/79 33/65 \nf 41/81 42/82 34/67 35/69 \nf 36/72 37/74 35/70 34/68 \nf 31/59 32/62 37/73 36/71 \nf 38/75 46/86 37/73 32/61 \nf 43/83 39/77 35/69 \nf 46/86 43/83 35/69 37/73 \nf 34/67 33/64 31/58 36/71 \n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes1/corner_r.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng StickerR\nv 2.69 1 2.6\nv 2.69 1 1\nv 2.69 2.6 2.6\nv 2.69 2.6 1\n\nvt 0.05 0.05 0.05\nvt 0.95 0.05 0.05\nvt 0.05 0.95 0.05\nvt 0.95 0.95 0.05\n\nf 2/2 4/4 3/3 1/1 \n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes1/corner_u.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng StickerU\nv 1.006716 2.69 2.595209\nv 2.606716 2.69 2.595209\nv 1.006716 2.69 0.995209\nv 2.606716 2.69 0.995209\n\nvt 0.05 0.05 0.05\nvt 0.95 0.05 0.05\nvt 0.05 0.95 0.05\nvt 0.95 0.95 0.05\n\nf 2/2 4/4 3/3 1/1 \n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes1/corner_f.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng StickerF\nv 1 1 2.69\nv 2.6 1 2.69\nv 1 2.6 2.69\nv 2.6 2.6 2.69\n\nvt 0.05 0.05 0.05\nvt 0.95 0.05 0.05\nvt 0.05 0.95 0.05\nvt 0.95 0.95 0.05\n\nf 2/2 4/4 3/3 1/1 \n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes1/edge.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng Boole Cube\nv 0.45 0.45 0.45\nv 0.45 1.35 0.45\nv 1.35 0.45 0.45\nv 1.35 0.45 -0.45\nv 0.45 0.45 -0.45\nv 0.45 1.35 -0.45\nv 1.35 0.905 0.45\nv 0.905 1.35 0.45\nv 1.35 0.905 -0.45\nv 0.905 1.35 -0.45\nv 0.905 1.005 0.45\nv 1.005 0.905 0.45\nv 0.905 1.005 -0.45\nv 1.005 0.905 -0.45\n\nvt 0 1 0\nvt 1 0 0\nvt 0 0 0\nvt 0 0 0\nvt 1 1 0\nvt 0 1 0\nvt 1 1 0\nvt 0 0 0\nvt 1 0 0\nvt 1 0 0\nvt 0 0 0\nvt 0 0 0\nvt 1 0 0\nvt 0 1 0\nvt 1 1 0\nvt 0 0.505556 0\nvt 1 0.505556 0\nvt 0.505556 0 0\nvt 0.505556 1 0\nvt 0 0.505556 0\nvt 1 0.505556 0\nvt 0.505556 1 0\nvt 0.494444 1 0\nvt 0.505556 0.616667 0\nvt 0.616667 0.505556 0\nvt 0.494444 0.616667 0\nvt 0.383333 0.505556 0\n\nf 12/25 3/9 7/17 \nf 1/3 11/24 8/19 2/6 \nf 12/25 11/24 1/3 3/9 \nf 7/16 3/8 4/10 9/21 \nf 13/26 6/15 10/23 \nf 14/27 9/20 4/11 5/13 \nf 13/26 14/27 5/13 6/15 \nf 1/2 2/5 6/14 5/12 \nf 2/4 8/18 10/22 6/14 \nf 4/10 3/7 1/1 5/12 \n\ng Boole Cube_1\nv 1.005 0.905 0.795\nv 2.595 0.905 0.795\nv 2.595 0.905 -0.795\nv 1.005 0.905 -0.795\nv 1.005 1.005 0.895\nv 2.595 1.005 0.895\nv 2.695 1.005 0.795\nv 2.695 1.005 -0.795\nv 2.595 1.005 -0.895\nv 1.005 1.005 -0.895\nv 0.905 1.005 -0.795\nv 0.905 1.005 0.795\nv 1.005 2.595 0.895\nv 2.595 2.595 0.895\nv 2.695 2.595 0.795\nv 2.695 2.595 -0.795\nv 2.595 2.595 -0.895\nv 1.005 2.595 -0.895\nv 0.905 2.595 -0.795\nv 0.905 2.595 0.795\nv 1.005 2.695 0.795\nv 2.595 2.695 0.795\nv 2.595 2.695 -0.795\nv 1.005 2.695 -0.795\nv 0.905 1.005 0.45\nv 1.005 0.905 0.45\nv 0.905 1.35 -0.45\nv 1.35 0.905 0.45\nv 0.905 1.005 -0.45\nv 1.005 0.905 -0.45\nv 0.905 1.35 0.45\nv 1.35 0.905 -0.45\n\nvt 0 1 0\nvt 0.955045 0 0\nvt 0.91009 0 0\nvt 0 0 0\nvt 1 1 0\nvt 0 0 0\nvt 0.955045 0 0\nvt 0.91009 0 0\nvt 1 0 0\nvt 0 0 0\nvt 0.955045 0 0\nvt 0.91009 0 0\nvt 0 0 0\nvt 0.955045 0 0\nvt 0.91009 0 0\nvt 1 0.082493 0\nvt 0 0.082493 0\nvt 0.91009 0.082493 0\nvt 0 0.082493 0\nvt 1 0.082493 0\nvt 0.91009 0.082493 0\nvt 0 0.082493 0\nvt 1 0.082493 0\nvt 0.91009 0.082493 0\nvt 0 0.082493 0\nvt 1 0.082493 0\nvt 0.91009 0.082493 0\nvt 1 0.917507 0\nvt 0 0.917507 0\nvt 0.91009 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.91009 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.91009 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.91009 0.917507 0\nvt 0.955045 1 0\nvt 0.91009 1 0\nvt 0 1 0\nvt 0 1 0\nvt 0.955045 1 0\nvt 0.91009 1 0\nvt 0 1 0\nvt 0.955045 1 0\nvt 0.91009 1 0\nvt 0 1 0\nvt 0.955045 1 0\nvt 0.91009 1 0\nvt 0.712618 0.082493 0\nvt 0 0.783019 0\nvt 0.712618 0 0\nvt 0.197472 0.263675 0\nvt 0.216981 0.783019 0\nvt 0.197472 0.082493 0\nvt 0 0.216981 0\nvt 0.197472 0 0\nvt 0.712618 0.263675 0\nvt 0.216981 0.216981 0\n\nf 16/35 20/45 19/44 15/31 \nf 20/45 28/57 27/56 19/44 \nf 28/57 36/72 35/69 27/56 \nf 21/47 20/45 16/34 \nf 21/47 29/59 28/57 20/45 \nf 29/59 36/71 28/57 \nf 17/39 22/48 21/46 16/33 \nf 42/83 46/88 17/36 16/32 \nf 30/60 37/75 36/70 29/58 \nf 23/50 22/48 17/38 \nf 23/50 31/62 30/60 22/48 \nf 31/62 37/74 30/60 \nf 18/42 24/51 23/49 17/37 \nf 24/51 32/63 31/61 23/49 \nf 32/63 38/78 37/73 31/61 \nf 25/53 24/51 18/41 \nf 25/53 33/65 32/63 24/51 \nf 33/65 38/77 32/63 \nf 26/54 39/79 40/81 15/30 \nf 18/40 44/86 43/84 25/52 \nf 43/84 41/82 33/64 25/52 \nf 45/87 39/79 26/54 34/66 \nf 41/82 45/87 34/66 33/64 \nf 34/66 35/68 38/76 33/64 \nf 19/43 26/54 15/29 \nf 19/43 27/55 34/66 26/54 \nf 27/55 35/67 34/66 \nf 17/36 46/88 44/85 18/40 \nf 42/83 16/32 15/28 40/80 \n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes1/edge_r.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng StickerR\nv 2.69 1 0.8\nv 2.69 1 -0.8\nv 2.69 2.6 0.8\nv 2.69 2.6 -0.8\n\nvt 0.05 0.05 0.05\nvt 0.95 0.05 0.05\nvt 0.05 0.95 0.05\nvt 0.95 0.95 0.05\n\nf 2/2 4/4 3/3 1/1 \n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes1/edge_u.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng StickerU\nv 1 2.69 0.8\nv 2.6 2.69 0.8\nv 1 2.69 -0.8\nv 2.6 2.69 -0.8\n\nvt 0.05 0.05 0.05\nvt 0.95 0.05 0.05\nvt 0.05 0.95 0.05\nvt 0.95 0.95 0.05\n\nf 2/2 4/4 3/3 1/1 \n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes1/side.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng Cylinder_Back\nv 0.9 -0.450003 0\nv 0.9 0 0.450003\nv 0.9 0 -0.450003\nv 0.9 0.450003 0\n\nvt 0 0 0\nvt 1 0 0\nvt 0 1 0\nvt 1 1 0\n\nf 2/2 4/4 3/3 1/1 \n\ng Cylinder\nv 0.905 -0.45 0\nv 1.695 -0.45 0\nv 0.905 0 -0.45\nv 1.695 0 -0.45\nv 0.905 0.45 0\nv 1.695 0.45 0\nv 0.905 0 0.45\nv 1.695 0 0.45\n\nvt 1 0 0\nvt 0 0 0\nvt 1 1 0\nvt 0 1 0\nvt 0.25 0 0\nvt 0.25 1 0\nvt 0.5 0 0\nvt 0.5 1 0\nvt 0.75 0 0\nvt 0.75 1 0\n\nf 7/9 8/10 6/8 5/6 \nf 9/11 10/12 8/10 7/9 \nf 11/13 12/14 10/12 9/11 \nf 5/5 6/7 12/14 11/13 \n\ng Cube\nv 1.79 -0.895 0.795\nv 2.59 -0.895 0.795\nv 2.59 -0.895 -0.795\nv 1.79 -0.895 -0.795\nv 1.79 -0.795 0.895\nv 2.59 -0.795 0.895\nv 2.69 -0.795 0.795\nv 2.69 -0.795 -0.795\nv 2.59 -0.795 -0.895\nv 1.79 -0.795 -0.895\nv 1.69 -0.795 -0.795\nv 1.69 -0.795 0.795\nv 1.79 0.795 0.895\nv 2.59 0.795 0.895\nv 2.69 0.795 0.795\nv 2.69 0.795 -0.795\nv 2.59 0.795 -0.895\nv 1.79 0.795 -0.895\nv 1.69 0.795 -0.795\nv 1.69 0.795 0.795\nv 1.79 0.895 0.795\nv 2.59 0.895 0.795\nv 2.59 0.895 -0.795\nv 1.79 0.895 -0.795\n\nvt 0.955045 0 0\nvt 0.91009 0 0\nvt 0 1 0\nvt 0 0 0\nvt 1 1 0\nvt 0 0 0\nvt 0.917938 0 0\nvt 0.835876 0 0\nvt 0 0 0\nvt 0.955045 0 0\nvt 1 0 0\nvt 0.91009 0 0\nvt 0 0 0\nvt 0.917938 0 0\nvt 0.835876 0 0\nvt 1 0.082493 0\nvt 0 0.082493 0\nvt 0.835876 0.082493 0\nvt 0 0.082493 0\nvt 1 0.082493 0\nvt 0.91009 0.082493 0\nvt 0 0.082493 0\nvt 1 0.082493 0\nvt 0.835876 0.082493 0\nvt 0 0.082493 0\nvt 1 0.082493 0\nvt 0.91009 0.082493 0\nvt 1 0.917507 0\nvt 0 0.917507 0\nvt 0.835876 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.91009 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.835876 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.91009 0.917507 0\nvt 0 0 0\nvt 0.955045 1 0\nvt 0.91009 1 0\nvt 0 1 0\nvt 1 0 0\nvt 0 1 0\nvt 0.917938 1 0\nvt 0.835876 1 0\nvt 1 1 0\nvt 0 1 0\nvt 0.955045 1 0\nvt 0.91009 1 0\nvt 0 1 0\nvt 0.917938 1 0\nvt 0.835876 1 0\n\nf 14/22 18/32 17/31 13/18 \nf 18/32 26/44 25/43 17/31 \nf 26/44 34/61 33/57 25/43 \nf 19/34 18/32 14/21 \nf 19/34 27/46 26/44 18/32 \nf 27/46 34/60 26/44 \nf 15/26 20/35 19/33 14/20 \nf 16/27 15/25 14/19 13/17 \nf 28/47 35/65 34/59 27/45 \nf 21/37 20/35 15/24 \nf 21/37 29/49 28/47 20/35 \nf 29/49 35/64 28/47 \nf 16/29 22/38 21/36 15/23 \nf 22/38 30/50 29/48 21/36 \nf 30/50 36/68 35/63 29/48 \nf 23/40 22/38 16/28 \nf 23/40 31/52 30/50 22/38 \nf 31/52 36/67 30/50 \nf 13/16 24/41 23/39 16/27 \nf 24/41 32/53 31/51 23/39 \nf 32/53 33/56 36/66 31/51 \nf 17/30 24/41 13/15 \nf 17/30 25/42 32/53 24/41 \nf 25/42 33/55 32/53 \nf 34/58 35/62 36/66 33/54 \n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes1/side_r.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng Sticker\nv 2.69 -0.8 0.8\nv 2.69 -0.8 -0.8\nv 2.69 0.8 0.8\nv 2.69 0.8 -0.8\n\nvt 0.05 0.05 0.05\nvt 0.95 0.05 0.05\nvt 0.05 0.95 0.05\nvt 0.95 0.95 0.05\n\nf 2/2 4/4 3/3 1/1 \n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes1/center.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng CenterPart_Simple Plane_Front\nv 0 -0.450003 0.9\nv 0.450003 0 0.9\nv -0.450003 0 0.9\nv 0 0.450003 0.9\n\nvt 0 0 0\nvt 1 0 0\nvt 0 1 0\nvt 1 1 0\n\nf 2/2 4/4 3/3 1/1 \n\ng CenterPart_Simple Plane_Back\nv 0.450003 0 -0.9\nv 0 -0.450003 -0.9\nv 0 0.450003 -0.9\nv -0.450003 0 -0.9\n\nvt 0 0 0\nvt 1 0 0\nvt 0 1 0\nvt 1 1 0\n\nf 6/6 8/8 7/7 5/5 \n\ng CenterPart_Simple Plane_Right\nv 0.9 0 0.450003\nv 0.9 -0.450003 0\nv 0.9 0.450003 0\nv 0.9 0 -0.450003\n\nvt 0 0 0\nvt 1 0 0\nvt 0 1 0\nvt 1 1 0\n\nf 10/10 12/12 11/11 9/9 \n\ng CenterPart_Simple Plane_Left\nv -0.9 -0.450003 0\nv -0.9 0 0.450003\nv -0.9 0 -0.450003\nv -0.9 0.450003 0\n\nvt 0 0 0\nvt 1 0 0\nvt 0 1 0\nvt 1 1 0\n\nf 14/14 16/16 15/15 13/13 \n\ng CenterPart_Simple Plane_Down\nv -0.450003 -0.9 0\nv 0 -0.9 -0.450003\nv 0 -0.9 0.450003\nv 0.450003 -0.9 0\n\nvt 0 0 0\nvt 1 0 0\nvt 0 1 0\nvt 1 1 0\n\nf 18/18 20/20 19/19 17/17 \n\ng CenterPart_Simple Plane_Up\nv 0 0.9 0.450003\nv 0.450003 0.9 0\nv -0.450003 0.9 0\nv 0 0.9 -0.450003\n\nvt 0 0 0\nvt 1 0 0\nvt 0 1 0\nvt 1 1 0\n\nf 22/22 24/24 23/23 21/21 \n\ng CenterPart_Simple Boole\nv 0.45 -0.9 0\nv 0.45 0.9 0\nv 0 -0.9 -0.45\nv 0 0.9 -0.45\nv -0.45 -0.9 0\nv -0.45 0.9 0\nv 0 -0.9 0.45\nv 0 0.9 0.45\nv 0 -0.45 -0.45\nv 0.45 0.45 0\nv -0.45 0.45 0\nv 0 0.45 -0.45\nv 0 0.45 0.45\nv -0.45 -0.45 0\nv -0.225 -0.225 0.225\nv 0.225 0.225 -0.225\nv -0.225 0.225 0.225\nv 0.225 0.225 0.225\nv 0.45 0 0.9\nv 0.45 0 -0.9\nv 0 -0.45 0.9\nv 0 -0.45 -0.9\nv -0.45 0 0.9\nv -0.45 0 -0.9\nv 0 0.45 0.9\nv 0 0.45 -0.9\nv -0.225 -0.225 -0.225\nv -0.225 0.225 -0.225\nv 0 -0.45 0.45\nv 0.225 -0.225 0.225\nv -0.9 -0.45 0\nv 0.9 -0.45 0\nv -0.9 0 -0.45\nv 0.9 0 -0.45\nv -0.9 0.45 0\nv 0.9 0.45 0\nv -0.9 0 0.45\nv 0.9 0 0.45\nv 0.45 0 0.45\nv -0.45 0 -0.45\nv -0.45 0 0.45\nv 0.45 0 -0.45\nv 0.45 -0.45 0\nv 0.225 -0.225 -0.225\n\nvt 1 0 0\nvt 0 0 0\nvt 1 1 0\nvt 0 1 0\nvt 0.25 0 0\nvt 0.25 1 0\nvt 0.5 0 0\nvt 0.5 1 0\nvt 0.75 0 0\nvt 0.75 1 0\nvt 0.25 0.75 0\nvt 0.25 0.25 0\nvt 0.5 0.75 0\nvt 1 0.75 0\nvt 0 0.75 0\nvt 0.5 0.25 0\nvt 0.5 0.75 0\nvt 0.75 0.75 0\nvt 0.25 0.75 0\nvt 0.75 0.25 0\nvt 0.75 0.75 0\nvt 1 0.25 0\nvt 0 0.25 0\nvt 0.5 0.25 0\nvt 0.875 0.375 0\nvt 0.375 0.375 0\nvt 0.625 0.375 0\nvt 0.375 0.625 0\nvt 0.875 0.625 0\nvt 0.125 0.625 0\nvt 0.625 0.375 0\nvt 0.625 0.375 0\nvt 0.625 0.625 0\nvt 0.625 0.625 0\nvt 0.875 0.375 0\nvt 0.875 0.625 0\nvt 1 0 0\nvt 0 0 0\nvt 1 1 0\nvt 0 1 0\nvt 0.25 0 0\nvt 0.25 1 0\nvt 0.5 0 0\nvt 0.5 1 0\nvt 0.75 0 0\nvt 0.75 1 0\nvt 0.125 0.375 0\nvt 0.375 0.625 0\nvt 0.375 0.375 0\nvt 0.375 0.375 0\nvt 0.625 0.625 0\nvt 0.375 0.625 0\nvt 0.25 0.25 0\nvt 0.75 0.25 0\nvt 0.875 0.625 0\nvt 0.125 0.375 0\nvt 0.875 0.375 0\nvt 1 0 0\nvt 0 0 0\nvt 1 1 0\nvt 0 1 0\nvt 0.25 0 0\nvt 0.25 1 0\nvt 0.5 0 0\nvt 0.5 1 0\nvt 0.75 0 0\nvt 0.75 1 0\nvt 0.75 0.75 0\nvt 1 0.25 0\nvt 0 0.25 0\nvt 0.25 0.25 0\nvt 0.5 0.75 0\nvt 0.75 0.25 0\nvt 0.5 0.25 0\nvt 0.25 0.75 0\nvt 1 0.75 0\nvt 0 0.75 0\nvt 1 0.75 0\nvt 0 0.75 0\nvt 1 0.25 0\nvt 0 0.25 0\nvt 0.125 0.625 0\nvt 0.125 0.625 0\nvt 0.125 0.375 0\n\nf 68/108 67/105 25/26 \nf 40/54 26/28 34/39 \nf 68/108 25/26 27/29 33/36 \nf 26/28 40/54 36/43 28/30 \nf 52/76 28/30 36/43 \nf 51/73 33/36 27/29 \nf 52/76 35/41 30/32 28/30 \nf 38/48 51/73 27/29 29/31 \nf 41/57 37/45 32/34 30/32 \nf 39/51 29/31 31/33 53/78 \nf 39/51 38/48 29/31 \nf 41/57 30/32 35/41 \nf 42/60 32/34 37/45 \nf 42/60 34/38 26/27 32/34 \nf 67/104 54/81 31/33 25/25 \nf 54/81 53/78 31/33 \nf 68/107 33/35 46/66 44/64 \nf 68/107 44/64 66/101 \nf 54/80 63/94 43/62 \nf 53/77 54/80 43/62 45/65 \nf 39/50 53/77 45/65 \nf 65/98 39/50 45/65 47/67 \nf 51/72 46/66 33/35 \nf 48/68 46/66 51/72 64/96 \nf 64/96 36/42 50/70 48/68 \nf 36/42 64/96 52/75 \nf 37/44 41/56 65/98 \nf 37/44 65/98 47/67 49/69 \nf 36/42 40/53 66/100 \nf 50/70 36/42 66/100 44/63 \nf 37/44 63/93 42/59 \nf 43/61 63/93 37/44 49/69 \nf 68/106 66/99 58/87 \nf 67/103 68/106 58/87 56/85 \nf 51/71 38/47 55/83 \nf 51/71 55/83 57/86 64/95 \nf 35/40 52/74 57/86 59/88 \nf 52/74 64/95 57/86 \nf 34/37 66/99 40/52 \nf 66/99 34/37 60/89 58/87 \nf 35/40 65/97 41/55 \nf 65/97 35/40 59/88 61/90 \nf 34/37 42/58 63/92 \nf 34/37 63/92 62/91 60/89 \nf 67/102 63/92 54/79 \nf 67/102 56/84 62/91 63/92 \nf 38/46 39/49 65/97 \nf 55/82 38/46 65/97 61/90 \n\n'
        );
        return { };
      });
    'use strict';
    define('PreloadRubiksCubeS4', ['J3DI'],
      function (J3DI) {
        J3DI.setFileData('lib/models/rubikscubes4/corner.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng corner Cube_1\nv 0.45 0.45 1.35\nv 0.45 1.35 1.35\nv 1.35 0.45 1.35\nv 1.35 1.35 1.35\nv 1.35 0.45 0.45\nv 1.35 1.35 0.45\nv 0.45 0.45 0.45\nv 0.45 1.35 0.45\n\nvt 0 1 0\nvt 1 0 0\nvt 0 0 0\nvt 0 0 0\nvt 1 1 0\nvt 0 1 0\nvt 1 1 0\nvt 0 0 0\nvt 1 0 0\nvt 1 0 0\nvt 0 1 0\nvt 1 1 0\nvt 1 0 0\nvt 0 0 0\nvt 1 1 0\nvt 0 1 0\nvt 0 0 0\nvt 1 0 0\nvt 0 1 0\nvt 1 1 0\n\nf 3/9 4/12 2/6 1/3 \nf 5/13 6/15 4/11 3/8 \nf 7/18 8/20 6/16 5/14 \nf 1/2 2/5 8/19 7/17 \nf 4/10 6/15 8/19 2/4 \nf 5/13 3/7 1/1 7/17 \n\ng corner Cube\nv 1.005 0.905 2.595\nv 2.595 0.905 2.595\nv 2.595 0.905 1.005\nv 1.005 0.905 1.005\nv 1.005 0.918397 2.645\nv 2.595 0.918397 2.645\nv 2.62 0.918397 2.638301\nv 2.638301 0.918397 2.62\nv 2.645 0.918397 2.595\nv 2.645 0.918397 1.005\nv 2.638301 0.918397 0.98\nv 2.62 0.918397 0.961699\nv 2.595 0.918397 0.955\nv 1.005 0.918397 0.955\nv 0.98 0.918397 0.961699\nv 0.961699 0.918397 0.98\nv 0.955 0.918397 1.005\nv 0.955 0.918397 2.595\nv 0.961699 0.918397 2.62\nv 0.98 0.918397 2.638301\nv 1.005 0.955 2.681602\nv 2.595 0.955 2.681602\nv 2.638301 0.955 2.67\nv 2.67 0.955 2.638301\nv 2.681602 0.955 2.595\nv 2.681602 0.955 1.005\nv 2.67 0.955 0.961699\nv 2.638301 0.955 0.93\nv 2.595 0.955 0.918397\nv 1.005 0.955 0.918397\nv 0.961699 0.955 0.93\nv 0.93 0.955 0.961699\nv 0.918397 0.955 1.005\nv 0.918397 0.955 2.595\nv 0.93 0.955 2.638301\nv 0.961699 0.955 2.67\nv 1.005 1.005 2.695\nv 2.595 1.005 2.695\nv 2.645 1.005 2.681602\nv 2.681602 1.005 2.645\nv 2.695 1.005 2.595\nv 2.695 1.005 1.005\nv 2.681602 1.005 0.955\nv 2.645 1.005 0.918397\nv 2.595 1.005 0.905\nv 1.005 1.005 0.905\nv 0.955 1.005 0.918397\nv 0.918397 1.005 0.955\nv 0.905 1.005 1.005\nv 0.905 1.005 2.595\nv 0.918397 1.005 2.645\nv 0.955 1.005 2.681602\nv 1.005 2.595 2.695\nv 2.595 2.595 2.695\nv 2.645 2.595 2.681602\nv 2.681602 2.595 2.645\nv 2.695 2.595 2.595\nv 2.695 2.595 1.005\nv 2.681602 2.595 0.955\nv 2.645 2.595 0.918397\nv 2.595 2.595 0.905\nv 1.005 2.595 0.905\nv 0.955 2.595 0.918397\nv 0.918397 2.595 0.955\nv 0.905 2.595 1.005\nv 0.905 2.595 2.595\nv 0.918397 2.595 2.645\nv 0.955 2.595 2.681602\nv 1.005 2.645 2.681602\nv 2.595 2.645 2.681602\nv 2.638301 2.645 2.67\nv 2.67 2.645 2.638301\nv 2.681602 2.645 2.595\nv 2.681602 2.645 1.005\nv 2.67 2.645 0.961699\nv 2.638301 2.645 0.93\nv 2.595 2.645 0.918397\nv 1.005 2.645 0.918397\nv 0.961699 2.645 0.93\nv 0.93 2.645 0.961699\nv 0.918397 2.645 1.005\nv 0.918397 2.645 2.595\nv 0.93 2.645 2.638301\nv 0.961699 2.645 2.67\nv 1.005 2.681602 2.645\nv 2.595 2.681602 2.645\nv 2.62 2.681602 2.638301\nv 2.638301 2.681602 2.62\nv 2.645 2.681602 2.595\nv 2.645 2.681602 1.005\nv 2.638301 2.681602 0.98\nv 2.62 2.681602 0.961699\nv 2.595 2.681602 0.955\nv 1.005 2.681602 0.955\nv 0.98 2.681602 0.961699\nv 0.961699 2.681602 0.98\nv 0.955 2.681602 1.005\nv 0.955 2.681602 2.595\nv 0.961699 2.681602 2.62\nv 0.98 2.681602 2.638301\nv 1.005 2.695 2.595\nv 2.595 2.695 2.595\nv 2.595 2.695 1.005\nv 1.005 2.695 1.005\n\nvt 0.985015 0 0\nvt 0.955045 0 0\nvt 0.925075 0 0\nvt 0.91009 0 0\nvt 0 1 0\nvt 0 0 0\nvt 1 1 0\nvt 0 0 0\nvt 0.985015 0 0\nvt 0.955045 0 0\nvt 0.925075 0 0\nvt 0.91009 0 0\nvt 0 0 0\nvt 0.985015 0 0\nvt 0.955045 0 0\nvt 0.925075 0 0\nvt 1 0 0\nvt 0.91009 0 0\nvt 0 0 0\nvt 0.985015 0 0\nvt 0.955045 0 0\nvt 0.925075 0 0\nvt 0.91009 0 0\nvt 1 0.027498 0\nvt 0 0.027498 0\nvt 0.91009 0.027498 0\nvt 0.94006 0.027498 0\nvt 0.97003 0.027498 0\nvt 0 0.027498 0\nvt 1 0.027498 0\nvt 0.91009 0.027498 0\nvt 0.94006 0.027498 0\nvt 0.97003 0.027498 0\nvt 0 0.027498 0\nvt 1 0.027498 0\nvt 0.91009 0.027498 0\nvt 0.94006 0.027498 0\nvt 0.97003 0.027498 0\nvt 0 0.027498 0\nvt 1 0.027498 0\nvt 0.91009 0.027498 0\nvt 0.94006 0.027498 0\nvt 0.97003 0.027498 0\nvt 1 0.054995 0\nvt 0 0.054995 0\nvt 0.91009 0.054995 0\nvt 0.94006 0.054995 0\nvt 0.97003 0.054995 0\nvt 0 0.054995 0\nvt 1 0.054995 0\nvt 0.91009 0.054995 0\nvt 0.94006 0.054995 0\nvt 0.97003 0.054995 0\nvt 0 0.054995 0\nvt 1 0.054995 0\nvt 0.91009 0.054995 0\nvt 0.94006 0.054995 0\nvt 0.97003 0.054995 0\nvt 0 0.054995 0\nvt 1 0.054995 0\nvt 0.91009 0.054995 0\nvt 0.94006 0.054995 0\nvt 0.97003 0.054995 0\nvt 1 0.082493 0\nvt 0 0.082493 0\nvt 0.91009 0.082493 0\nvt 0.94006 0.082493 0\nvt 0.97003 0.082493 0\nvt 0 0.082493 0\nvt 1 0.082493 0\nvt 0.91009 0.082493 0\nvt 0.94006 0.082493 0\nvt 0.97003 0.082493 0\nvt 0 0.082493 0\nvt 1 0.082493 0\nvt 0.91009 0.082493 0\nvt 0.94006 0.082493 0\nvt 0.97003 0.082493 0\nvt 0 0.082493 0\nvt 1 0.082493 0\nvt 0.91009 0.082493 0\nvt 0.94006 0.082493 0\nvt 0.97003 0.082493 0\nvt 1 0.917507 0\nvt 0 0.917507 0\nvt 0.91009 0.917507 0\nvt 0.94006 0.917507 0\nvt 0.97003 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.91009 0.917507 0\nvt 0.94006 0.917507 0\nvt 0.97003 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.91009 0.917507 0\nvt 0.94006 0.917507 0\nvt 0.97003 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.91009 0.917507 0\nvt 0.94006 0.917507 0\nvt 0.97003 0.917507 0\nvt 1 0.945005 0\nvt 0 0.945005 0\nvt 0.91009 0.945005 0\nvt 0.94006 0.945005 0\nvt 0.97003 0.945005 0\nvt 0 0.945005 0\nvt 1 0.945005 0\nvt 0.91009 0.945005 0\nvt 0.94006 0.945005 0\nvt 0.97003 0.945005 0\nvt 0 0.945005 0\nvt 1 0.945005 0\nvt 0.91009 0.945005 0\nvt 0.94006 0.945005 0\nvt 0.97003 0.945005 0\nvt 0 0.945005 0\nvt 1 0.945005 0\nvt 0.91009 0.945005 0\nvt 0.94006 0.945005 0\nvt 0.97003 0.945005 0\nvt 1 0.972502 0\nvt 0 0.972502 0\nvt 0.91009 0.972502 0\nvt 0.94006 0.972502 0\nvt 0.97003 0.972502 0\nvt 0 0.972502 0\nvt 1 0.972502 0\nvt 0.91009 0.972502 0\nvt 0.94006 0.972502 0\nvt 0.97003 0.972502 0\nvt 0 0.972502 0\nvt 1 0.972502 0\nvt 0.91009 0.972502 0\nvt 0.94006 0.972502 0\nvt 0.97003 0.972502 0\nvt 0 0.972502 0\nvt 1 0.972502 0\nvt 0.91009 0.972502 0\nvt 0.94006 0.972502 0\nvt 0.97003 0.972502 0\nvt 0.955045 1 0\nvt 0.925075 1 0\nvt 0.91009 1 0\nvt 0 1 0\nvt 0.985015 1 0\nvt 0 1 0\nvt 0.985015 1 0\nvt 0.955045 1 0\nvt 0.925075 1 0\nvt 0.91009 1 0\nvt 0 1 0\nvt 0.985015 1 0\nvt 0.955045 1 0\nvt 0.925075 1 0\nvt 0.91009 1 0\nvt 0 1 0\nvt 0.985015 1 0\nvt 0.955045 1 0\nvt 0.925075 1 0\nvt 0.91009 1 0\n\nf 10/32 14/46 13/45 9/26 \nf 14/46 30/66 29/65 13/45 \nf 30/66 46/86 45/85 29/65 \nf 93/144 109/168 108/163 \nf 62/106 78/126 77/125 61/105 \nf 78/126 94/146 93/145 77/125 \nf 94/146 110/173 109/167 93/145 \nf 15/47 14/46 10/31 \nf 15/47 31/67 30/66 14/46 \nf 31/67 47/87 46/86 30/66 \nf 47/87 63/107 62/106 46/86 \nf 63/107 79/127 78/126 62/106 \nf 79/127 95/147 94/146 78/126 \nf 95/147 110/172 94/146 \nf 16/48 15/47 10/30 \nf 16/48 32/68 31/67 15/47 \nf 32/68 48/88 47/87 31/67 \nf 48/88 64/108 63/107 47/87 \nf 64/108 80/128 79/127 63/107 \nf 80/128 96/148 95/147 79/127 \nf 96/148 110/171 95/147 \nf 17/50 16/48 10/29 \nf 17/50 33/70 32/68 16/48 \nf 33/70 49/90 48/88 32/68 \nf 49/90 65/110 64/108 48/88 \nf 65/110 81/130 80/128 64/108 \nf 81/130 97/150 96/148 80/128 \nf 97/150 110/170 96/148 \nf 11/38 18/51 17/49 10/28 \nf 18/51 34/71 33/69 17/49 \nf 34/71 50/91 49/89 33/69 \nf 12/39 11/37 10/27 9/25 \nf 66/111 82/131 81/129 65/109 \nf 82/131 98/151 97/149 81/129 \nf 98/151 111/178 110/169 97/149 \nf 19/52 18/51 11/36 \nf 19/52 35/72 34/71 18/51 \nf 35/72 51/92 50/91 34/71 \nf 51/92 67/112 66/111 50/91 \nf 67/112 83/132 82/131 66/111 \nf 83/132 99/152 98/151 82/131 \nf 99/152 111/177 98/151 \nf 20/53 19/52 11/35 \nf 20/53 36/73 35/72 19/52 \nf 36/73 52/93 51/92 35/72 \nf 52/93 68/113 67/112 51/92 \nf 68/113 84/133 83/132 67/112 \nf 84/133 100/153 99/152 83/132 \nf 100/153 111/176 99/152 \nf 21/55 20/53 11/34 \nf 21/55 37/75 36/73 20/53 \nf 37/75 53/95 52/93 36/73 \nf 53/95 69/115 68/113 52/93 \nf 69/115 85/135 84/133 68/113 \nf 85/135 101/155 100/153 84/133 \nf 101/155 111/175 100/153 \nf 12/43 22/56 21/54 11/33 \nf 22/56 38/76 37/74 21/54 \nf 38/76 54/96 53/94 37/74 \nf 54/96 70/116 69/114 53/94 \nf 70/116 86/136 85/134 69/114 \nf 86/136 102/156 101/154 85/134 \nf 102/156 112/183 111/174 101/154 \nf 23/57 22/56 12/42 \nf 23/57 39/77 38/76 22/56 \nf 39/77 55/97 54/96 38/76 \nf 55/97 71/117 70/116 54/96 \nf 71/117 87/137 86/136 70/116 \nf 87/137 103/157 102/156 86/136 \nf 103/157 112/182 102/156 \nf 24/58 23/57 12/41 \nf 24/58 40/78 39/77 23/57 \nf 40/78 56/98 55/97 39/77 \nf 56/98 72/118 71/117 55/97 \nf 72/118 88/138 87/137 71/117 \nf 88/138 104/158 103/157 87/137 \nf 104/158 112/181 103/157 \nf 25/60 24/58 12/40 \nf 25/60 41/80 40/78 24/58 \nf 41/80 57/100 56/98 40/78 \nf 57/100 73/120 72/118 56/98 \nf 73/120 89/140 88/138 72/118 \nf 89/140 105/160 104/158 88/138 \nf 105/160 112/180 104/158 \nf 9/24 26/61 25/59 12/39 \nf 26/61 42/81 41/79 25/59 \nf 42/81 58/101 57/99 41/79 \nf 58/101 74/121 73/119 57/99 \nf 74/121 90/141 89/139 73/119 \nf 90/141 106/161 105/159 89/139 \nf 106/161 109/166 112/179 105/159 \nf 27/62 26/61 9/23 \nf 27/62 43/82 42/81 26/61 \nf 43/82 59/102 58/101 42/81 \nf 59/102 75/122 74/121 58/101 \nf 75/122 91/142 90/141 74/121 \nf 91/142 107/162 106/161 90/141 \nf 107/162 109/165 106/161 \nf 28/63 27/62 9/22 \nf 28/63 44/83 43/82 27/62 \nf 44/83 60/103 59/102 43/82 \nf 60/103 76/123 75/122 59/102 \nf 76/123 92/143 91/142 75/122 \nf 92/143 108/163 107/162 91/142 \nf 108/163 109/164 107/162 \nf 13/44 28/63 9/21 \nf 13/44 29/64 44/83 28/63 \nf 29/64 45/84 60/103 44/83 \nf 45/84 61/104 76/123 60/103 \nf 61/104 77/124 92/143 76/123 \nf 77/124 93/144 108/163 92/143 \n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes4/corner_r.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng corner_r StickerR\nusemtl Stickers\nv 2.61 1 2.6\nv 2.61 2.6 2.6\nv 2.71 1 2.6\nv 2.71 2.6 2.6\nv 2.71 1 1\nv 2.71 2.6 1\nv 2.61 1 1\nv 2.61 2.6 1\n\nvt 0.05 0.00 0\nvt 0.95 0.05 0\nvt 0.00 0.05 0\nvt 0.05 1.00 0\nvt 0.95 0.95 0\n#6:\nvt 0.00 0.95 0\nvt 0.05 0.05 0\nvt 0.05 0.05 0.05\nvt 0.05 0.05 0\nvt 0.05 0.95 0\n#11:\nvt 0.05 0.95 0.05\nvt 0.05 0.95 0\nvt 0.95 0.05 0\nvt 0.95 0.05 0\nvt 0.95 0.95 0\n#16:\nvt 0.95 0.95 0\nvt 0.95 0.00 0\nvt 1.00 0.05 0\nvt 0.95 1.00 0\nvt 1.00 0.95 0\n\n#front:\nf 3/9 4/12 2/6 1/3 \n#right:\nf 5/13 6/15 4/11 3/8 \n#back:\nf 7/18 8/20 6/16 5/14 \n#left:\nf 1/13 2/15 8/11 7/8 \n#up:\nf 4/10 6/15 8/19 2/4 \n#down:\nf 5/13 3/7 1/1 7/17 \n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes4/corner_u.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng corner_u StickerU\nusemtl Stickers\nv 1 2.61 2.6\nv 1 2.71 2.6\nv 2.6 2.61 2.6\nv 2.6 2.71 2.6\nv 2.6 2.61 1\nv 2.6 2.71 1\nv 1 2.61 1\nv 1 2.71 1\n\nvt 0.05 0.95 0\nvt 0.00 0.05 0 \nvt 0.05 0.00 0\nvt 0.05 0.05 0\nvt 0.05 0.05 0\nvt 0.05 0.05 0\nvt 1 1 0\nvt 0.95 0.05 0\nvt 0.95 0.00 0\nvt 0.95 0.05 0\n#11:\nvt 0.95 0.05 0\nvt 0.95 0.05 0\nvt 1.00 0.95 0\nvt 0.95 1.00 0\nvt 0.95 0.95 0\nvt 0.95 0.95 0\nvt 0.00 0.95 0\nvt 0.05 1.00 0\nvt 0.05 0.95 0\nvt 0.05 0.95 0\n\n#front:\nf 3/9 4/12 2/6 1/3 \n#right:\nf 5/13 6/15 4/11 3/8 \n#back:\nf 7/18 8/20 6/16 5/14 \n#left:\nf 1/2 2/5 8/1 7/17 \n#up:\nf 4/10 6/15 8/19 2/4 \n#down:\nf 5/10 3/15 1/19 7/4 \n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes4/corner_f.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng corner_f StickerF\nusemtl Stickers\nv 1 1 2.71\nv 1 2.6 2.71\nv 2.6 1 2.71\nv 2.6 2.6 2.71\nv 2.6 1 2.61\nv 2.6 2.6 2.61\nv 1 1 2.61\nv 1 2.6 2.61\n\nvt 0.05 0.05 0\nvt 0.05 0.05 0\nvt 0.05 0.05 0\nvt 0.05 0.95 0\nvt 0.05 0.95 0\n#6:\nvt 0.05 0.95 0\nvt 0.95 0.05 0\nvt 0.95 0.05 0\nvt 0.95 0.05 0\nvt 0.95 0.95 0\n#11:\nvt 0.95 0.95 0\nvt 0.95 0.95 0\nvt 1.00 0.05 0\nvt 0.95 0.00 0\nvt 1.00 0.95 0\n#16:\nvt 0.05 0.00 0\nvt 0.05 0.05 0\nvt 0.00 0.05 0\nvt 0.00 0.95 0\nvt 0.05 1.00 0\n#21:\nvt 0.95 1.00 0\n\n#front:\nf 3/9 4/12 2/6 1/3 \n#right:\nf 5/13 6/15 4/11 3/8 \n#back:\nf 7/9 8/12 6/6 5/3 \n#front:\nf 1/2 2/5 8/19 7/17 \n#up:\nf 4/10 6/21 8/20 2/4 \n#down:\nf 5/14 3/7 1/1 7/16\n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes4/edge.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng edge Cube_1\nv 2.595 0.905 0.795\nv 2.595 0.905 -0.795\nv 1.005 0.905 -0.795\nv 1.005 0.905 0.795\nv 2.645 0.918397 0.795\nv 2.645 0.918397 -0.795\nv 2.638301 0.918397 -0.82\nv 2.62 0.918397 -0.838301\nv 2.595 0.918397 -0.845\nv 1.005 0.918397 -0.845\nv 0.98 0.918397 -0.838301\nv 0.961699 0.918397 -0.82\nv 0.955 0.918397 -0.795\nv 0.955 0.918397 0.795\nv 0.961699 0.918397 0.82\nv 0.98 0.918397 0.838301\nv 1.005 0.918397 0.845\nv 2.595 0.918397 0.845\nv 2.62 0.918397 0.838301\nv 2.638301 0.918397 0.82\nv 2.681602 0.955 0.795\nv 2.681602 0.955 -0.795\nv 2.67 0.955 -0.838301\nv 2.638301 0.955 -0.87\nv 2.595 0.955 -0.881603\nv 1.005 0.955 -0.881602\nv 0.961699 0.955 -0.87\nv 0.93 0.955 -0.838301\nv 0.918397 0.955 -0.795\nv 0.918397 0.955 0.795\nv 0.93 0.955 0.838301\nv 0.961699 0.955 0.87\nv 1.005 0.955 0.881603\nv 2.595 0.955 0.881602\nv 2.638301 0.955 0.87\nv 2.67 0.955 0.838301\nv 2.695 1.005 0.795\nv 2.695 1.005 -0.795\nv 2.681602 1.005 -0.845\nv 2.645 1.005 -0.881603\nv 2.595 1.005 -0.895\nv 1.005 1.005 -0.895\nv 0.955 1.005 -0.881602\nv 0.918397 1.005 -0.845\nv 0.905 1.005 -0.795\nv 0.905 1.005 0.795\nv 0.918397 1.005 0.845\nv 0.955 1.005 0.881603\nv 1.005 1.005 0.895\nv 2.595 1.005 0.895\nv 2.645 1.005 0.881602\nv 2.681602 1.005 0.845\nv 2.695 2.595 0.795\nv 2.695 2.595 -0.795\nv 2.681602 2.595 -0.845\nv 2.645 2.595 -0.881603\nv 2.595 2.595 -0.895\nv 1.005 2.595 -0.895\nv 0.955 2.595 -0.881602\nv 0.918397 2.595 -0.845\nv 0.905 2.595 -0.795\nv 0.905 2.595 0.795\nv 0.918397 2.595 0.845\nv 0.955 2.595 0.881603\nv 1.005 2.595 0.895\nv 2.595 2.595 0.895\nv 2.645 2.595 0.881602\nv 2.681602 2.595 0.845\nv 2.681602 2.645 0.795\nv 2.681602 2.645 -0.795\nv 2.67 2.645 -0.838301\nv 2.638301 2.645 -0.87\nv 2.595 2.645 -0.881603\nv 1.005 2.645 -0.881602\nv 0.961699 2.645 -0.87\nv 0.93 2.645 -0.838301\nv 0.918397 2.645 -0.795\nv 0.918397 2.645 0.795\nv 0.93 2.645 0.838301\nv 0.961699 2.645 0.87\nv 1.005 2.645 0.881603\nv 2.595 2.645 0.881602\nv 2.638301 2.645 0.87\nv 2.67 2.645 0.838301\nv 2.645 2.681602 0.795\nv 2.645 2.681602 -0.795\nv 2.638301 2.681602 -0.82\nv 2.62 2.681602 -0.838301\nv 2.595 2.681602 -0.845\nv 1.005 2.681602 -0.845\nv 0.98 2.681602 -0.838301\nv 0.961699 2.681602 -0.82\nv 0.955 2.681602 -0.795\nv 0.955 2.681602 0.795\nv 0.961699 2.681602 0.82\nv 0.98 2.681602 0.838301\nv 1.005 2.681602 0.845\nv 2.595 2.681602 0.845\nv 2.62 2.681602 0.838301\nv 2.638301 2.681602 0.82\nv 2.595 2.695 0.795\nv 2.595 2.695 -0.795\nv 1.005 2.695 -0.795\nv 1.005 2.695 0.795\n\nvt 0.985015 0 0\nvt 0.955045 0 0\nvt 0.925075 0 0\nvt 0.91009 0 0\nvt 0 1 0\nvt 0 0 0\nvt 0 0 0\nvt 0.985015 0 0\nvt 0.955045 0 0\nvt 0.925075 0 0\nvt 1 1 0\nvt 0.91009 0 0\nvt 0 0 0\nvt 0.985015 0 0\nvt 0.955045 0 0\nvt 0.925075 0 0\nvt 0.91009 0 0\nvt 1 0 0\nvt 0 0 0\nvt 0.985015 0 0\nvt 0.955045 0 0\nvt 0.925075 0 0\nvt 0.91009 0 0\nvt 1 0.027498 0\nvt 0 0.027498 0\nvt 0.91009 0.027498 0\nvt 0.94006 0.027498 0\nvt 0.97003 0.027498 0\nvt 0 0.027498 0\nvt 1 0.027498 0\nvt 0.91009 0.027498 0\nvt 0.94006 0.027498 0\nvt 0.97003 0.027498 0\nvt 0 0.027498 0\nvt 1 0.027498 0\nvt 0.91009 0.027498 0\nvt 0.94006 0.027498 0\nvt 0.97003 0.027498 0\nvt 0 0.027498 0\nvt 1 0.027498 0\nvt 0.91009 0.027498 0\nvt 0.94006 0.027498 0\nvt 0.97003 0.027498 0\nvt 1 0.054995 0\nvt 0 0.054995 0\nvt 0.91009 0.054995 0\nvt 0.94006 0.054995 0\nvt 0.97003 0.054995 0\nvt 0 0.054995 0\nvt 1 0.054995 0\nvt 0.91009 0.054995 0\nvt 0.94006 0.054995 0\nvt 0.97003 0.054995 0\nvt 0 0.054995 0\nvt 1 0.054995 0\nvt 0.91009 0.054995 0\nvt 0.94006 0.054995 0\nvt 0.97003 0.054995 0\nvt 0 0.054995 0\nvt 1 0.054995 0\nvt 0.91009 0.054995 0\nvt 0.94006 0.054995 0\nvt 0.97003 0.054995 0\nvt 1 0.082493 0\nvt 0 0.082493 0\nvt 0.91009 0.082493 0\nvt 0.94006 0.082493 0\nvt 0.97003 0.082493 0\nvt 0 0.082493 0\nvt 1 0.082493 0\nvt 0.91009 0.082493 0\nvt 0.94006 0.082493 0\nvt 0.97003 0.082493 0\nvt 0 0.082493 0\nvt 1 0.082493 0\nvt 0.91009 0.082493 0\nvt 0.94006 0.082493 0\nvt 0.97003 0.082493 0\nvt 0 0.082493 0\nvt 1 0.082493 0\nvt 0.91009 0.082493 0\nvt 0.94006 0.082493 0\nvt 0.97003 0.082493 0\nvt 1 0.917507 0\nvt 0 0.917507 0\nvt 0.91009 0.917507 0\nvt 0.94006 0.917507 0\nvt 0.97003 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.91009 0.917507 0\nvt 0.94006 0.917507 0\nvt 0.97003 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.91009 0.917507 0\nvt 0.94006 0.917507 0\nvt 0.97003 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.91009 0.917507 0\nvt 0.94006 0.917507 0\nvt 0.97003 0.917507 0\nvt 1 0.945005 0\nvt 0 0.945005 0\nvt 0.91009 0.945005 0\nvt 0.94006 0.945005 0\nvt 0.97003 0.945005 0\nvt 0 0.945005 0\nvt 1 0.945005 0\nvt 0.91009 0.945005 0\nvt 0.94006 0.945005 0\nvt 0.97003 0.945005 0\nvt 0 0.945005 0\nvt 1 0.945005 0\nvt 0.91009 0.945005 0\nvt 0.94006 0.945005 0\nvt 0.97003 0.945005 0\nvt 0 0.945005 0\nvt 1 0.945005 0\nvt 0.91009 0.945005 0\nvt 0.94006 0.945005 0\nvt 0.97003 0.945005 0\nvt 1 0.972502 0\nvt 0 0.972502 0\nvt 0.91009 0.972502 0\nvt 0.94006 0.972502 0\nvt 0.97003 0.972502 0\nvt 0 0.972502 0\nvt 1 0.972502 0\nvt 0.91009 0.972502 0\nvt 0.94006 0.972502 0\nvt 0.97003 0.972502 0\nvt 0 0.972502 0\nvt 1 0.972502 0\nvt 0.91009 0.972502 0\nvt 0.94006 0.972502 0\nvt 0.97003 0.972502 0\nvt 0 0.972502 0\nvt 1 0.972502 0\nvt 0.91009 0.972502 0\nvt 0.94006 0.972502 0\nvt 0.97003 0.972502 0\nvt 0.985015 1 0\nvt 0.955045 1 0\nvt 0.925075 1 0\nvt 0.91009 1 0\nvt 0 1 0\nvt 0 1 0\nvt 0.985015 1 0\nvt 0.955045 1 0\nvt 0.925075 1 0\nvt 0.91009 1 0\nvt 0 1 0\nvt 0.985015 1 0\nvt 0.955045 1 0\nvt 0.925075 1 0\nvt 0.91009 1 0\nvt 0 1 0\nvt 0.985015 1 0\nvt 0.955045 1 0\nvt 0.925075 1 0\nvt 0.91009 1 0\n\nf 2/12 6/26 5/25 1/6 \nf 6/26 22/46 21/45 5/25 \nf 22/46 38/66 37/65 21/45 \nf 4/19 3/18 2/11 1/5 \nf 54/86 70/106 69/105 53/85 \nf 70/106 86/126 85/125 69/105 \nf 86/126 102/153 101/148 85/125 \nf 7/27 6/26 2/10 \nf 7/27 23/47 22/46 6/26 \nf 23/47 39/67 38/66 22/46 \nf 39/67 55/87 54/86 38/66 \nf 55/87 71/107 70/106 54/86 \nf 71/107 87/127 86/126 70/106 \nf 87/127 102/152 86/126 \nf 8/28 7/27 2/9 \nf 8/28 24/48 23/47 7/27 \nf 24/48 40/68 39/67 23/47 \nf 40/68 56/88 55/87 39/67 \nf 56/88 72/108 71/107 55/87 \nf 72/108 88/128 87/127 71/107 \nf 88/128 102/151 87/127 \nf 9/30 8/28 2/8 \nf 9/30 25/50 24/48 8/28 \nf 25/50 41/70 40/68 24/48 \nf 41/70 57/90 56/88 40/68 \nf 57/90 73/110 72/108 56/88 \nf 73/110 89/130 88/128 72/108 \nf 89/130 102/150 88/128 \nf 3/17 10/31 9/29 2/7 \nf 10/31 26/51 25/49 9/29 \nf 26/51 42/71 41/69 25/49 \nf 42/71 58/91 57/89 41/69 \nf 58/91 74/111 73/109 57/89 \nf 74/111 90/131 89/129 73/109 \nf 90/131 103/158 102/149 89/129 \nf 11/32 10/31 3/16 \nf 11/32 27/52 26/51 10/31 \nf 27/52 43/72 42/71 26/51 \nf 43/72 59/92 58/91 42/71 \nf 59/92 75/112 74/111 58/91 \nf 75/112 91/132 90/131 74/111 \nf 91/132 103/157 90/131 \nf 12/33 11/32 3/15 \nf 12/33 28/53 27/52 11/32 \nf 28/53 44/73 43/72 27/52 \nf 44/73 60/93 59/92 43/72 \nf 60/93 76/113 75/112 59/92 \nf 76/113 92/133 91/132 75/112 \nf 92/133 103/156 91/132 \nf 13/35 12/33 3/14 \nf 13/35 29/55 28/53 12/33 \nf 29/55 45/75 44/73 28/53 \nf 45/75 61/95 60/93 44/73 \nf 61/95 77/115 76/113 60/93 \nf 77/115 93/135 92/133 76/113 \nf 93/135 103/155 92/133 \nf 4/23 14/36 13/34 3/13 \nf 14/36 30/56 29/54 13/34 \nf 30/56 46/76 45/74 29/54 \nf 46/76 62/96 61/94 45/74 \nf 62/96 78/116 77/114 61/94 \nf 78/116 94/136 93/134 77/114 \nf 94/136 104/163 103/154 93/134 \nf 15/37 14/36 4/22 \nf 15/37 31/57 30/56 14/36 \nf 31/57 47/77 46/76 30/56 \nf 47/77 63/97 62/96 46/76 \nf 63/97 79/117 78/116 62/96 \nf 79/117 95/137 94/136 78/116 \nf 95/137 104/162 94/136 \nf 16/38 15/37 4/21 \nf 16/38 32/58 31/57 15/37 \nf 32/58 48/78 47/77 31/57 \nf 48/78 64/98 63/97 47/77 \nf 64/98 80/118 79/117 63/97 \nf 80/118 96/138 95/137 79/117 \nf 96/138 104/161 95/137 \nf 17/40 16/38 4/20 \nf 17/40 33/60 32/58 16/38 \nf 33/60 49/80 48/78 32/58 \nf 49/80 65/100 64/98 48/78 \nf 65/100 81/120 80/118 64/98 \nf 81/120 97/140 96/138 80/118 \nf 97/140 104/160 96/138 \nf 1/4 18/41 17/39 4/19 \nf 18/41 34/61 33/59 17/39 \nf 34/61 50/81 49/79 33/59 \nf 50/81 66/101 65/99 49/79 \nf 66/101 82/121 81/119 65/99 \nf 82/121 98/141 97/139 81/119 \nf 98/141 101/147 104/159 97/139 \nf 19/42 18/41 1/3 \nf 19/42 35/62 34/61 18/41 \nf 35/62 51/82 50/81 34/61 \nf 51/82 67/102 66/101 50/81 \nf 67/102 83/122 82/121 66/101 \nf 83/122 99/142 98/141 82/121 \nf 99/142 101/146 98/141 \nf 20/43 19/42 1/2 \nf 20/43 36/63 35/62 19/42 \nf 36/63 52/83 51/82 35/62 \nf 52/83 68/103 67/102 51/82 \nf 68/103 84/123 83/122 67/102 \nf 84/123 100/143 99/142 83/122 \nf 100/143 101/145 99/142 \nf 5/24 20/43 1/1 \nf 5/24 21/44 36/63 20/43 \nf 21/44 37/64 52/83 36/63 \nf 37/64 53/84 68/103 52/83 \nf 53/84 69/104 84/123 68/103 \nf 69/104 85/124 100/143 84/123 \nf 85/124 101/144 100/143 \n\ng edge Cube\nv 1.35 0.45 0.45\nv 1.35 1.35 0.45\nv 1.35 0.45 -0.45\nv 1.35 1.35 -0.45\nv 0.45 0.45 -0.45\nv 0.45 1.35 -0.45\nv 0.45 0.45 0.45\nv 0.45 1.35 0.45\n\nvt 0 1 0\nvt 1 0 0\nvt 0 0 0\nvt 0 0 0\nvt 1 1 0\nvt 0 1 0\nvt 1 1 0\nvt 0 0 0\nvt 1 0 0\nvt 1 0 0\nvt 0 1 0\nvt 1 1 0\nvt 1 0 0\nvt 0 0 0\nvt 1 1 0\nvt 0 1 0\nvt 0 0 0\nvt 1 0 0\nvt 0 1 0\nvt 1 1 0\n\nf 107/172 108/175 106/169 105/166 \nf 109/176 110/178 108/174 107/171 \nf 111/181 112/183 110/179 109/177 \nf 105/165 106/168 112/182 111/180 \nf 108/173 110/178 112/182 106/167 \nf 109/176 107/170 105/164 111/180 \n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes4/edge_r.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng edge_r StickerF\nusemtl Stickers\nv 2.71 1 0.8\nv 2.71 2.6 0.8\nv 2.71 1 -0.8\nv 2.71 2.6 -0.8\nv 2.61 1 -0.8\nv 2.61 2.6 -0.8\nv 2.61 1 0.8\nv 2.61 2.6 0.8\n\nvt 0.05 0.05 0\nvt 0.05 0.05 0\nvt 0.05 0.05 0\nvt 0.05 0.95 0\nvt 0.05 0.95 0\n#6:\nvt 0.05 0.95 0\nvt 0.95 0.05 0\nvt 0.95 0.05 0\nvt 0.95 0.05 0\nvt 0.95 0.95 0\n#11:\nvt 0.95 0.95 0\nvt 0.95 0.95 0\nvt 1.00 0.05 0\nvt 0.95 0.00 0\nvt 1.00 0.95 0\n#16:\nvt 0.05 0.00 0\nvt 0.05 0.05 0\nvt 0.00 0.05 0\nvt 0.00 0.95 0\nvt 0.05 1.00 0\n#21:\nvt 0.95 1.00 0\n\n#front:\nf 3/9 4/12 2/6 1/3 \n#right:\nf 5/13 6/15 4/11 3/8 \n#back:\nf 7/9 8/12 6/6 5/3 \n#front:\nf 1/2 2/5 8/19 7/17 \n#up:\nf 4/10 6/21 8/20 2/4 \n#down:\nf 5/14 3/7 1/1 7/16\n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes4/edge_u.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng edge_u_1 StickerU\nusemtl Stickers\nv 1 2.61 0.8\nv 1 2.71 0.8\nv 2.6 2.61 0.8\nv 2.6 2.71 0.8\nv 2.6 2.61 -0.8\nv 2.6 2.71 -0.8\nv 1 2.61 -0.8\nv 1 2.71 -0.8\n\nvt 0.05 0.95 0\nvt 0.00 0.05 0 \nvt 0.05 0.00 0\nvt 0.05 0.05 0\nvt 0.05 0.05 0\nvt 0.05 0.05 0\nvt 1 1 0\nvt 0.95 0.05 0\nvt 0.95 0.00 0\nvt 0.95 0.05 0\n#11:\nvt 0.95 0.05 0\nvt 0.95 0.05 0\nvt 1.00 0.95 0\nvt 0.95 1.00 0\nvt 0.95 0.95 0\nvt 0.95 0.95 0\nvt 0.00 0.95 0\nvt 0.05 1.00 0\nvt 0.05 0.95 0\nvt 0.05 0.95 0\n\n#front:\nf 3/9 4/12 2/6 1/3 \n#right:\nf 5/13 6/15 4/11 3/8 \n#back:\nf 7/18 8/20 6/16 5/14 \n#left:\nf 1/2 2/5 8/1 7/17 \n#up:\nf 4/10 6/15 8/19 2/4 \n#down:\nf 5/10 3/15 1/19 7/4 \n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes4/side.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng side Disc\nv 0.915 0 0\nv 0.915 0 -0.45\nv 0.915 -0.172208 -0.415746\nv 0.915 -0.318198 -0.318198\nv 0.915 -0.415746 -0.172207\nv 0.915 -0.45 0\nv 0.915 -0.415746 0.172208\nv 0.915 -0.318198 0.318198\nv 0.915 -0.172207 0.415746\nv 0.915 0 0.45\nv 0.915 0.172208 0.415746\nv 0.915 0.318198 0.318198\nv 0.915 0.415746 0.172207\nv 0.915 0.45 0\nv 0.915 0.415746 -0.172208\nv 0.915 0.318198 -0.318198\nv 0.915 0.172208 -0.415746\n\nvt 0.5 0.5 0\nvt 1 0.5 0\nvt 0.96194 0.691342 0\nvt 0.853553 0.853553 0\nvt 0.691342 0.96194 0\nvt 0.5 1 0\nvt 0.308658 0.96194 0\nvt 0.146447 0.853553 0\nvt 0.03806 0.691342 0\nvt 0 0.5 0\nvt 0.03806 0.308658 0\nvt 0.146447 0.146447 0\nvt 0.308658 0.03806 0\nvt 0.5 0 0\nvt 0.691342 0.03806 0\nvt 0.853554 0.146447 0\nvt 0.96194 0.308658 0\n\nf 3/3 1/1 2/2 \nf 4/4 1/1 3/3 \nf 5/5 1/1 4/4 \nf 6/6 1/1 5/5 \nf 7/7 1/1 6/6 \nf 8/8 1/1 7/7 \nf 9/9 1/1 8/8 \nf 10/10 1/1 9/9 \nf 11/11 1/1 10/10 \nf 12/12 1/1 11/11 \nf 13/13 1/1 12/12 \nf 14/14 1/1 13/13 \nf 15/15 1/1 14/14 \nf 16/16 1/1 15/15 \nf 17/17 1/1 16/16 \nf 2/2 1/1 17/17 \n\ng side Cylinder\nv 1.705 0 -0.45\nv 0.915 0 -0.45\nv 1.705 -0.172208 -0.415746\nv 0.915 -0.172208 -0.415746\nv 1.705 -0.318198 -0.318198\nv 0.915 -0.318198 -0.318198\nv 1.705 -0.415746 -0.172208\nv 0.915 -0.415746 -0.172208\nv 1.705 -0.45 0\nv 0.915 -0.45 0\nv 1.705 -0.415746 0.172208\nv 0.915 -0.415746 0.172208\nv 1.705 -0.318198 0.318198\nv 0.915 -0.318198 0.318198\nv 1.705 -0.172207 0.415746\nv 0.915 -0.172207 0.415746\nv 1.705 0 0.45\nv 0.915 0 0.45\nv 1.705 0.172208 0.415746\nv 0.915 0.172208 0.415746\nv 1.705 0.318198 0.318198\nv 0.915 0.318198 0.318198\nv 1.705 0.415746 0.172207\nv 0.915 0.415746 0.172207\nv 1.705 0.45 0\nv 0.915 0.45 0\nv 1.705 0.415746 -0.172208\nv 0.915 0.415746 -0.172208\nv 1.705 0.318198 -0.318198\nv 0.915 0.318198 -0.318198\nv 1.705 0.172208 -0.415746\nv 0.915 0.172208 -0.415746\n\nvt 1 0 0\nvt 0 0 0\nvt 1 1 0\nvt 0 1 0\nvt 0.0625 0 0\nvt 0.0625 1 0\nvt 0.125 0 0\nvt 0.125 1 0\nvt 0.1875 0 0\nvt 0.1875 1 0\nvt 0.25 0 0\nvt 0.25 1 0\nvt 0.3125 0 0\nvt 0.3125 1 0\nvt 0.375 0 0\nvt 0.375 1 0\nvt 0.4375 0 0\nvt 0.4375 1 0\nvt 0.5 0 0\nvt 0.5 1 0\nvt 0.5625 0 0\nvt 0.5625 1 0\nvt 0.625 0 0\nvt 0.625 1 0\nvt 0.6875 0 0\nvt 0.6875 1 0\nvt 0.75 0 0\nvt 0.75 1 0\nvt 0.8125 0 0\nvt 0.8125 1 0\nvt 0.875 0 0\nvt 0.875 1 0\nvt 0.9375 0 0\nvt 0.9375 1 0\n\nf 20/22 21/23 19/21 18/19 \nf 22/24 23/25 21/23 20/22 \nf 24/26 25/27 23/25 22/24 \nf 26/28 27/29 25/27 24/26 \nf 28/30 29/31 27/29 26/28 \nf 30/32 31/33 29/31 28/30 \nf 32/34 33/35 31/33 30/32 \nf 34/36 35/37 33/35 32/34 \nf 36/38 37/39 35/37 34/36 \nf 38/40 39/41 37/39 36/38 \nf 40/42 41/43 39/41 38/40 \nf 42/44 43/45 41/43 40/42 \nf 44/46 45/47 43/45 42/44 \nf 46/48 47/49 45/47 44/46 \nf 48/50 49/51 47/49 46/48 \nf 18/18 19/20 49/51 48/50 \n\ng side Cube\nv 2.6 -0.895 0.795\nv 2.6 -0.895 -0.795\nv 1.8 -0.895 -0.795\nv 1.8 -0.895 0.795\nv 2.65 -0.881603 0.795\nv 2.65 -0.881603 -0.795\nv 2.643301 -0.881603 -0.82\nv 2.625 -0.881603 -0.838301\nv 2.6 -0.881603 -0.845\nv 1.8 -0.881603 -0.845\nv 1.775 -0.881603 -0.838301\nv 1.756699 -0.881603 -0.82\nv 1.75 -0.881603 -0.795\nv 1.75 -0.881603 0.795\nv 1.756699 -0.881603 0.82\nv 1.775 -0.881603 0.838301\nv 1.8 -0.881603 0.845\nv 2.6 -0.881603 0.845\nv 2.625 -0.881603 0.838301\nv 2.643301 -0.881603 0.82\nv 2.686603 -0.845 0.795\nv 2.686603 -0.845 -0.795\nv 2.675 -0.845 -0.838301\nv 2.643301 -0.845 -0.87\nv 2.6 -0.845 -0.881603\nv 1.8 -0.845 -0.881603\nv 1.756699 -0.845 -0.87\nv 1.725 -0.845 -0.838301\nv 1.713398 -0.845 -0.795\nv 1.713398 -0.845 0.795\nv 1.725 -0.845 0.838301\nv 1.756699 -0.845 0.87\nv 1.8 -0.845 0.881603\nv 2.6 -0.845 0.881603\nv 2.643301 -0.845 0.87\nv 2.675 -0.845 0.838301\nv 2.7 -0.795 0.795\nv 2.7 -0.795 -0.795\nv 2.686603 -0.795 -0.845\nv 2.65 -0.795 -0.881603\nv 2.6 -0.795 -0.895\nv 1.8 -0.795 -0.895\nv 1.75 -0.795 -0.881603\nv 1.713398 -0.795 -0.845\nv 1.7 -0.795 -0.795\nv 1.7 -0.795 0.795\nv 1.713398 -0.795 0.845\nv 1.75 -0.795 0.881603\nv 1.8 -0.795 0.895\nv 2.6 -0.795 0.895\nv 2.65 -0.795 0.881603\nv 2.686603 -0.795 0.845\nv 2.7 0.795 0.795\nv 2.7 0.795 -0.795\nv 2.686603 0.795 -0.845\nv 2.65 0.795 -0.881603\nv 2.6 0.795 -0.895\nv 1.8 0.795 -0.895\nv 1.75 0.795 -0.881603\nv 1.713398 0.795 -0.845\nv 1.7 0.795 -0.795\nv 1.7 0.795 0.795\nv 1.713398 0.795 0.845\nv 1.75 0.795 0.881603\nv 1.8 0.795 0.895\nv 2.6 0.795 0.895\nv 2.65 0.795 0.881603\nv 2.686603 0.795 0.845\nv 2.686603 0.845 0.795\nv 2.686603 0.845 -0.795\nv 2.675 0.845 -0.838301\nv 2.643301 0.845 -0.87\nv 2.6 0.845 -0.881603\nv 1.8 0.845 -0.881603\nv 1.756699 0.845 -0.87\nv 1.725 0.845 -0.838301\nv 1.713398 0.845 -0.795\nv 1.713398 0.845 0.795\nv 1.725 0.845 0.838301\nv 1.756699 0.845 0.87\nv 1.8 0.845 0.881603\nv 2.6 0.845 0.881603\nv 2.643301 0.845 0.87\nv 2.675 0.845 0.838301\nv 2.65 0.881603 0.795\nv 2.65 0.881603 -0.795\nv 2.643301 0.881603 -0.82\nv 2.625 0.881603 -0.838301\nv 2.6 0.881603 -0.845\nv 1.8 0.881603 -0.845\nv 1.775 0.881603 -0.838301\nv 1.756699 0.881603 -0.82\nv 1.75 0.881603 -0.795\nv 1.75 0.881603 0.795\nv 1.756699 0.881603 0.82\nv 1.775 0.881603 0.838301\nv 1.8 0.881603 0.845\nv 2.6 0.881603 0.845\nv 2.625 0.881603 0.838301\nv 2.643301 0.881603 0.82\nv 2.6 0.895 0.795\nv 2.6 0.895 -0.795\nv 1.8 0.895 -0.795\nv 1.8 0.895 0.795\n\nvt 0.972646 0 0\nvt 0.917938 0 0\nvt 0.86323 0 0\nvt 0.835876 0 0\nvt 0 1 0\nvt 0 0 0\nvt 0 0 0\nvt 0.985015 0 0\nvt 0.955045 0 0\nvt 0.925075 0 0\nvt 1 1 0\nvt 0.91009 0 0\nvt 0 0 0\nvt 0.972646 0 0\nvt 0.917938 0 0\nvt 0.86323 0 0\nvt 0.835876 0 0\nvt 1 0 0\nvt 0 0 0\nvt 0.985015 0 0\nvt 0.955045 0 0\nvt 0.925075 0 0\nvt 0.91009 0 0\nvt 1 0.027498 0\nvt 0 0.027498 0\nvt 0.91009 0.027498 0\nvt 0.94006 0.027498 0\nvt 0.97003 0.027498 0\nvt 0 0.027498 0\nvt 1 0.027498 0\nvt 0.835876 0.027498 0\nvt 0.890584 0.027498 0\nvt 0.945292 0.027498 0\nvt 0 0.027498 0\nvt 1 0.027498 0\nvt 0.91009 0.027498 0\nvt 0.94006 0.027498 0\nvt 0.97003 0.027498 0\nvt 0 0.027498 0\nvt 1 0.027498 0\nvt 0.835876 0.027498 0\nvt 0.890584 0.027498 0\nvt 0.945292 0.027498 0\nvt 1 0.054995 0\nvt 0 0.054995 0\nvt 0.91009 0.054995 0\nvt 0.94006 0.054995 0\nvt 0.97003 0.054995 0\nvt 0 0.054995 0\nvt 1 0.054995 0\nvt 0.835876 0.054995 0\nvt 0.890584 0.054995 0\nvt 0.945292 0.054995 0\nvt 0 0.054995 0\nvt 1 0.054995 0\nvt 0.91009 0.054995 0\nvt 0.94006 0.054995 0\nvt 0.97003 0.054995 0\nvt 0 0.054995 0\nvt 1 0.054995 0\nvt 0.835876 0.054995 0\nvt 0.890584 0.054995 0\nvt 0.945292 0.054995 0\nvt 1 0.082493 0\nvt 0 0.082493 0\nvt 0.91009 0.082493 0\nvt 0.94006 0.082493 0\nvt 0.97003 0.082493 0\nvt 0 0.082493 0\nvt 1 0.082493 0\nvt 0.835876 0.082493 0\nvt 0.890584 0.082493 0\nvt 0.945292 0.082493 0\nvt 0 0.082493 0\nvt 1 0.082493 0\nvt 0.91009 0.082493 0\nvt 0.94006 0.082493 0\nvt 0.97003 0.082493 0\nvt 0 0.082493 0\nvt 1 0.082493 0\nvt 0.835876 0.082493 0\nvt 0.890584 0.082493 0\nvt 0.945292 0.082493 0\nvt 1 0.917507 0\nvt 0 0.917507 0\nvt 0.91009 0.917507 0\nvt 0.94006 0.917507 0\nvt 0.97003 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.835876 0.917507 0\nvt 0.890584 0.917507 0\nvt 0.945292 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.91009 0.917507 0\nvt 0.94006 0.917507 0\nvt 0.97003 0.917507 0\nvt 0 0.917507 0\nvt 1 0.917507 0\nvt 0.835876 0.917507 0\nvt 0.890584 0.917507 0\nvt 0.945292 0.917507 0\nvt 1 0.945005 0\nvt 0 0.945005 0\nvt 0.91009 0.945005 0\nvt 0.94006 0.945005 0\nvt 0.97003 0.945005 0\nvt 0 0.945005 0\nvt 1 0.945005 0\nvt 0.835876 0.945005 0\nvt 0.890584 0.945005 0\nvt 0.945292 0.945005 0\nvt 0 0.945005 0\nvt 1 0.945005 0\nvt 0.91009 0.945005 0\nvt 0.94006 0.945005 0\nvt 0.97003 0.945005 0\nvt 0 0.945005 0\nvt 1 0.945005 0\nvt 0.835876 0.945005 0\nvt 0.890584 0.945005 0\nvt 0.945292 0.945005 0\nvt 1 0.972502 0\nvt 0 0.972502 0\nvt 0.91009 0.972502 0\nvt 0.94006 0.972502 0\nvt 0.97003 0.972502 0\nvt 0 0.972502 0\nvt 1 0.972502 0\nvt 0.835876 0.972502 0\nvt 0.890584 0.972502 0\nvt 0.945292 0.972502 0\nvt 0 0.972502 0\nvt 1 0.972502 0\nvt 0.91009 0.972502 0\nvt 0.94006 0.972502 0\nvt 0.97003 0.972502 0\nvt 0 0.972502 0\nvt 1 0.972502 0\nvt 0.835876 0.972502 0\nvt 0.890584 0.972502 0\nvt 0.945292 0.972502 0\nvt 0 0 0\nvt 0.972646 1 0\nvt 0.917938 1 0\nvt 0.86323 1 0\nvt 0.835876 1 0\nvt 0 1 0\nvt 1 0 0\nvt 0 1 0\nvt 0.985015 1 0\nvt 0.955045 1 0\nvt 0.925075 1 0\nvt 0.91009 1 0\nvt 1 1 0\nvt 0 1 0\nvt 0.972646 1 0\nvt 0.917938 1 0\nvt 0.86323 1 0\nvt 0.835876 1 0\nvt 0 1 0\nvt 0.985015 1 0\nvt 0.955045 1 0\nvt 0.925075 1 0\nvt 0.91009 1 0\n\nf 51/63 55/77 54/76 50/57 \nf 55/77 71/97 70/96 54/76 \nf 71/97 87/117 86/116 70/96 \nf 53/70 52/69 51/62 50/56 \nf 103/137 119/157 118/156 102/136 \nf 119/157 135/177 134/176 118/156 \nf 135/177 151/206 150/200 134/176 \nf 56/78 55/77 51/61 \nf 56/78 72/98 71/97 55/77 \nf 72/98 88/118 87/117 71/97 \nf 88/118 104/138 103/137 87/117 \nf 104/138 120/158 119/157 103/137 \nf 120/158 136/178 135/177 119/157 \nf 136/178 151/205 135/177 \nf 57/79 56/78 51/60 \nf 57/79 73/99 72/98 56/78 \nf 73/99 89/119 88/118 72/98 \nf 89/119 105/139 104/138 88/118 \nf 105/139 121/159 120/158 104/138 \nf 121/159 137/179 136/178 120/158 \nf 137/179 151/204 136/178 \nf 58/81 57/79 51/59 \nf 58/81 74/101 73/99 57/79 \nf 74/101 90/121 89/119 73/99 \nf 90/121 106/141 105/139 89/119 \nf 106/141 122/161 121/159 105/139 \nf 122/161 138/181 137/179 121/159 \nf 138/181 151/203 137/179 \nf 52/68 59/82 58/80 51/58 \nf 59/82 75/102 74/100 58/80 \nf 75/102 91/122 90/120 74/100 \nf 91/122 107/142 106/140 90/120 \nf 107/142 123/162 122/160 106/140 \nf 123/162 139/182 138/180 122/160 \nf 139/182 152/212 151/202 138/180 \nf 60/83 59/82 52/67 \nf 60/83 76/103 75/102 59/82 \nf 76/103 92/123 91/122 75/102 \nf 92/123 108/143 107/142 91/122 \nf 108/143 124/163 123/162 107/142 \nf 124/163 140/183 139/182 123/162 \nf 140/183 152/211 139/182 \nf 61/84 60/83 52/66 \nf 61/84 77/104 76/103 60/83 \nf 77/104 93/124 92/123 76/103 \nf 93/124 109/144 108/143 92/123 \nf 109/144 125/164 124/163 108/143 \nf 125/164 141/184 140/183 124/163 \nf 141/184 152/210 140/183 \nf 62/86 61/84 52/65 \nf 62/86 78/106 77/104 61/84 \nf 78/106 94/126 93/124 77/104 \nf 94/126 110/146 109/144 93/124 \nf 110/146 126/166 125/164 109/144 \nf 126/166 142/186 141/184 125/164 \nf 142/186 152/209 141/184 \nf 53/74 63/87 62/85 52/64 \nf 63/87 79/107 78/105 62/85 \nf 79/107 95/127 94/125 78/105 \nf 95/127 111/147 110/145 94/125 \nf 111/147 127/167 126/165 110/145 \nf 127/167 143/187 142/185 126/165 \nf 143/187 153/217 152/208 142/185 \nf 64/88 63/87 53/73 \nf 64/88 80/108 79/107 63/87 \nf 80/108 96/128 95/127 79/107 \nf 96/128 112/148 111/147 95/127 \nf 112/148 128/168 127/167 111/147 \nf 128/168 144/188 143/187 127/167 \nf 144/188 153/216 143/187 \nf 65/89 64/88 53/72 \nf 65/89 81/109 80/108 64/88 \nf 81/109 97/129 96/128 80/108 \nf 97/129 113/149 112/148 96/128 \nf 113/149 129/169 128/168 112/148 \nf 129/169 145/189 144/188 128/168 \nf 145/189 153/215 144/188 \nf 66/91 65/89 53/71 \nf 66/91 82/111 81/109 65/89 \nf 82/111 98/131 97/129 81/109 \nf 98/131 114/151 113/149 97/129 \nf 114/151 130/171 129/169 113/149 \nf 130/171 146/191 145/189 129/169 \nf 146/191 153/214 145/189 \nf 50/55 67/92 66/90 53/70 \nf 67/92 83/112 82/110 66/90 \nf 83/112 99/132 98/130 82/110 \nf 99/132 115/152 114/150 98/130 \nf 115/152 131/172 130/170 114/150 \nf 131/172 147/192 146/190 130/170 \nf 147/192 150/199 153/213 146/190 \nf 68/93 67/92 50/54 \nf 68/93 84/113 83/112 67/92 \nf 84/113 100/133 99/132 83/112 \nf 100/133 116/153 115/152 99/132 \nf 116/153 132/173 131/172 115/152 \nf 132/173 148/193 147/192 131/172 \nf 148/193 150/198 147/192 \nf 69/94 68/93 50/53 \nf 69/94 85/114 84/113 68/93 \nf 85/114 101/134 100/133 84/113 \nf 101/134 117/154 116/153 100/133 \nf 117/154 133/174 132/173 116/153 \nf 133/174 149/194 148/193 132/173 \nf 149/194 150/197 148/193 \nf 54/75 69/94 50/52 \nf 54/75 70/95 85/114 69/94 \nf 70/95 86/115 101/134 85/114 \nf 86/115 102/135 117/154 101/134 \nf 102/135 118/155 133/174 117/154 \nf 118/155 134/175 149/194 133/174 \nf 134/175 150/196 149/194 \nf 151/201 152/207 153/213 150/195 \n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes4/side_r.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng side_r Sticker\nusemtl Stickers\nv 2.71 -0.8 0.8\nv 2.71 0.8 0.8\nv 2.71 -0.8 -0.8\nv 2.71 0.8 -0.8\nv 2.61 -0.8 -0.8\nv 2.61 0.8 -0.8\nv 2.61 -0.8 0.8\nv 2.61 0.8 0.8\n\nvt 0.05 0.05 0\nvt 0.05 0.05 0\nvt 0.05 0.05 0\nvt 0.05 0.95 0\nvt 0.05 0.95 0\n#6:\nvt 0.05 0.95 0\nvt 0.95 0.05 0\nvt 0.95 0.05 0\nvt 0.95 0.05 0\nvt 0.95 0.95 0\n#11:\nvt 0.95 0.95 0\nvt 0.95 0.95 0\nvt 1.00 0.05 0\nvt 0.95 0.00 0\nvt 1.00 0.95 0\n#16:\nvt 0.05 0.00 0\nvt 0.05 0.05 0\nvt 0.00 0.05 0\nvt 0.00 0.95 0\nvt 0.00 0.95 0\nvt 0.05 1.00 0\n#21:\nvt 0.95 1.00 0\n\n#right:\nf 3/9 4/12 2/6 1/3 \n#back:\nf 5/13 6/15 4/11 3/8 \n#left:\nf 7/9 8/12 6/6 5/3 \n#front:\nf 1/2 2/5 8/19 7/17 \n#up:\nf 4/10 6/21 8/20 2/4 \n#down:\nf 5/14 3/7 1/1 7/16\n\n'
        );
        J3DI.setFileData('lib/models/rubikscubes4/center.obj',
          '# WaveFront *.obj file (generated by CINEMA 4D)\n\ng CenterPart Cylinder_Y\nv -0.008281 -0.9 0.004201\nv -0.008281 0.9 0.004201\nv 0.441719 -0.9 0.004201\nv 0.441719 -0.9 0.004201\nv 0.441719 0.9 0.004201\nv 0.441719 0.9 0.004201\nv 0.407465 -0.9 -0.168007\nv 0.407465 -0.9 -0.168007\nv 0.407465 0.9 -0.168007\nv 0.407465 0.9 -0.168007\nv 0.309917 -0.9 -0.313997\nv 0.309917 -0.9 -0.313997\nv 0.309917 0.9 -0.313997\nv 0.309917 0.9 -0.313997\nv 0.163927 -0.9 -0.411545\nv 0.163927 -0.9 -0.411545\nv 0.163927 0.9 -0.411545\nv 0.163927 0.9 -0.411545\nv -0.008281 -0.9 -0.445799\nv -0.008281 -0.9 -0.445799\nv -0.008281 0.9 -0.445799\nv -0.008281 0.9 -0.445799\nv -0.180488 -0.9 -0.411545\nv -0.180488 -0.9 -0.411545\nv -0.180488 0.9 -0.411545\nv -0.180488 0.9 -0.411545\nv -0.326479 -0.9 -0.313997\nv -0.326479 -0.9 -0.313997\nv -0.326479 0.9 -0.313997\nv -0.326479 0.9 -0.313997\nv -0.424027 -0.9 -0.168007\nv -0.424027 -0.9 -0.168007\nv -0.424027 0.9 -0.168007\nv -0.424027 0.9 -0.168007\nv -0.458281 -0.9 0.004201\nv -0.458281 -0.9 0.004201\nv -0.458281 0.9 0.004201\nv -0.458281 0.9 0.004201\nv -0.424027 -0.9 0.176408\nv -0.424027 -0.9 0.176408\nv -0.424027 0.9 0.176408\nv -0.424027 0.9 0.176408\nv -0.326479 -0.9 0.322399\nv -0.326479 -0.9 0.322399\nv -0.326479 0.9 0.322399\nv -0.326479 0.9 0.322399\nv -0.180488 -0.9 0.419947\nv -0.180488 -0.9 0.419947\nv -0.180488 0.9 0.419947\nv -0.180488 0.9 0.419947\nv -0.008281 -0.9 0.454201\nv -0.008281 -0.9 0.454201\nv -0.008281 0.9 0.454201\nv -0.008281 0.9 0.454201\nv 0.163927 -0.9 0.419947\nv 0.163927 -0.9 0.419947\nv 0.163927 0.9 0.419947\nv 0.163927 0.9 0.419947\nv 0.309917 -0.9 0.322399\nv 0.309917 -0.9 0.322399\nv 0.309917 0.9 0.322399\nv 0.309917 0.9 0.322399\nv 0.407465 -0.9 0.176408\nv 0.407465 -0.9 0.176408\nv 0.407465 0.9 0.176408\nv 0.407465 0.9 0.176408\n\nvt 0.5 0.5 0\nvt 0.5 0.5 0\nvt 0 0.5 0\nvt 1 0 0\nvt 0 0 0\nvt 1 1 0\nvt 0 1 0\nvt 1 0.5 0\nvt 0.03806 0.691342 0\nvt 0.0625 0 0\nvt 0.0625 1 0\nvt 0.96194 0.691342 0\nvt 0.146447 0.853553 0\nvt 0.125 0 0\nvt 0.125 1 0\nvt 0.853553 0.853553 0\nvt 0.308658 0.96194 0\nvt 0.1875 0 0\nvt 0.1875 1 0\nvt 0.691342 0.96194 0\nvt 0.5 1 0\nvt 0.25 0 0\nvt 0.25 1 0\nvt 0.5 1 0\nvt 0.691342 0.96194 0\nvt 0.3125 0 0\nvt 0.3125 1 0\nvt 0.308658 0.96194 0\nvt 0.853553 0.853553 0\nvt 0.375 0 0\nvt 0.375 1 0\nvt 0.146447 0.853553 0\nvt 0.96194 0.691342 0\nvt 0.4375 0 0\nvt 0.4375 1 0\nvt 0.03806 0.691342 0\nvt 1 0.5 0\nvt 0.5 0 0\nvt 0.5 1 0\nvt 0 0.5 0\nvt 0.96194 0.308658 0\nvt 0.5625 0 0\nvt 0.5625 1 0\nvt 0.03806 0.308658 0\nvt 0.853553 0.146447 0\nvt 0.625 0 0\nvt 0.625 1 0\nvt 0.146447 0.146447 0\nvt 0.691342 0.03806 0\nvt 0.6875 0 0\nvt 0.6875 1 0\nvt 0.308658 0.03806 0\nvt 0.5 0 0\nvt 0.75 0 0\nvt 0.75 1 0\nvt 0.5 0 0\nvt 0.308658 0.03806 0\nvt 0.8125 0 0\nvt 0.8125 1 0\nvt 0.691342 0.03806 0\nvt 0.146446 0.146447 0\nvt 0.875 0 0\nvt 0.875 1 0\nvt 0.853554 0.146447 0\nvt 0.03806 0.308658 0\nvt 0.9375 0 0\nvt 0.9375 1 0\nvt 0.96194 0.308658 0\n\nf 7/9 3/3 1/1 \nf 8/10 9/11 5/7 4/5 \nf 10/12 2/2 6/8 \nf 11/13 7/9 1/1 \nf 12/14 13/15 9/11 8/10 \nf 14/16 2/2 10/12 \nf 15/17 11/13 1/1 \nf 16/18 17/19 13/15 12/14 \nf 18/20 2/2 14/16 \nf 19/21 15/17 1/1 \nf 20/22 21/23 17/19 16/18 \nf 22/24 2/2 18/20 \nf 23/25 19/21 1/1 \nf 24/26 25/27 21/23 20/22 \nf 26/28 2/2 22/24 \nf 27/29 23/25 1/1 \nf 28/30 29/31 25/27 24/26 \nf 30/32 2/2 26/28 \nf 31/33 27/29 1/1 \nf 32/34 33/35 29/31 28/30 \nf 34/36 2/2 30/32 \nf 35/37 31/33 1/1 \nf 36/38 37/39 33/35 32/34 \nf 38/40 2/2 34/36 \nf 39/41 35/37 1/1 \nf 40/42 41/43 37/39 36/38 \nf 42/44 2/2 38/40 \nf 43/45 39/41 1/1 \nf 44/46 45/47 41/43 40/42 \nf 46/48 2/2 42/44 \nf 47/49 43/45 1/1 \nf 48/50 49/51 45/47 44/46 \nf 50/52 2/2 46/48 \nf 51/53 47/49 1/1 \nf 52/54 53/55 49/51 48/50 \nf 54/56 2/2 50/52 \nf 55/57 51/53 1/1 \nf 56/58 57/59 53/55 52/54 \nf 58/60 2/2 54/56 \nf 59/61 55/57 1/1 \nf 60/62 61/63 57/59 56/58 \nf 62/64 2/2 58/60 \nf 63/65 59/61 1/1 \nf 64/66 65/67 61/63 60/62 \nf 66/68 2/2 62/64 \nf 3/3 63/65 1/1 \nf 4/4 5/6 65/67 64/66 \nf 6/8 2/2 66/68 \n\ng CenterPart Cylinder_X\nv -0.908281 0 0.004201\nv 0.891719 0 0.004201\nv -0.908281 -0.45 0.004201\nv -0.908281 -0.45 0.004201\nv 0.891719 -0.45 0.004201\nv 0.891719 -0.45 0.004201\nv -0.908281 -0.415746 -0.168007\nv -0.908281 -0.415746 -0.168007\nv 0.891719 -0.415746 -0.168007\nv 0.891719 -0.415746 -0.168007\nv -0.908281 -0.318198 -0.313997\nv -0.908281 -0.318198 -0.313997\nv 0.891719 -0.318198 -0.313997\nv 0.891719 -0.318198 -0.313997\nv -0.908281 -0.172208 -0.411545\nv -0.908281 -0.172208 -0.411545\nv 0.891719 -0.172208 -0.411545\nv 0.891719 -0.172208 -0.411545\nv -0.908281 0 -0.445799\nv -0.908281 0 -0.445799\nv 0.891719 0 -0.445799\nv 0.891719 0 -0.445799\nv -0.908281 0.172208 -0.411545\nv -0.908281 0.172208 -0.411545\nv 0.891719 0.172208 -0.411545\nv 0.891719 0.172208 -0.411545\nv -0.908281 0.318198 -0.313997\nv -0.908281 0.318198 -0.313997\nv 0.891719 0.318198 -0.313997\nv 0.891719 0.318198 -0.313997\nv -0.908281 0.415746 -0.168007\nv -0.908281 0.415746 -0.168007\nv 0.891719 0.415746 -0.168007\nv 0.891719 0.415746 -0.168007\nv -0.908281 0.45 0.004201\nv -0.908281 0.45 0.004201\nv 0.891719 0.45 0.004201\nv 0.891719 0.45 0.004201\nv -0.908281 0.415746 0.176408\nv -0.908281 0.415746 0.176408\nv 0.891719 0.415746 0.176408\nv 0.891719 0.415746 0.176408\nv -0.908281 0.318198 0.322399\nv -0.908281 0.318198 0.322399\nv 0.891719 0.318198 0.322399\nv 0.891719 0.318198 0.322399\nv -0.908281 0.172207 0.419947\nv -0.908281 0.172207 0.419947\nv 0.891719 0.172207 0.419947\nv 0.891719 0.172207 0.419947\nv -0.908281 0 0.454201\nv -0.908281 0 0.454201\nv 0.891719 0 0.454201\nv 0.891719 0 0.454201\nv -0.908281 -0.172208 0.419947\nv -0.908281 -0.172208 0.419947\nv 0.891719 -0.172208 0.419947\nv 0.891719 -0.172208 0.419947\nv -0.908281 -0.318198 0.322399\nv -0.908281 -0.318198 0.322399\nv 0.891719 -0.318198 0.322399\nv 0.891719 -0.318198 0.322399\nv -0.908281 -0.415746 0.176408\nv -0.908281 -0.415746 0.176408\nv 0.891719 -0.415746 0.176408\nv 0.891719 -0.415746 0.176408\n\nvt 0.5 0.5 0\nvt 0.5 0.5 0\nvt 0 0.5 0\nvt 1 0 0\nvt 0 0 0\nvt 1 1 0\nvt 0 1 0\nvt 1 0.5 0\nvt 0.03806 0.691342 0\nvt 0.0625 0 0\nvt 0.0625 1 0\nvt 0.96194 0.691342 0\nvt 0.146447 0.853553 0\nvt 0.125 0 0\nvt 0.125 1 0\nvt 0.853553 0.853553 0\nvt 0.308658 0.96194 0\nvt 0.1875 0 0\nvt 0.1875 1 0\nvt 0.691342 0.96194 0\nvt 0.5 1 0\nvt 0.25 0 0\nvt 0.25 1 0\nvt 0.5 1 0\nvt 0.691342 0.96194 0\nvt 0.3125 0 0\nvt 0.3125 1 0\nvt 0.308658 0.96194 0\nvt 0.853553 0.853553 0\nvt 0.375 0 0\nvt 0.375 1 0\nvt 0.146447 0.853553 0\nvt 0.96194 0.691342 0\nvt 0.4375 0 0\nvt 0.4375 1 0\nvt 0.03806 0.691342 0\nvt 1 0.5 0\nvt 0.5 0 0\nvt 0.5 1 0\nvt 0 0.5 0\nvt 0.96194 0.308658 0\nvt 0.5625 0 0\nvt 0.5625 1 0\nvt 0.03806 0.308658 0\nvt 0.853553 0.146447 0\nvt 0.625 0 0\nvt 0.625 1 0\nvt 0.146447 0.146447 0\nvt 0.691342 0.03806 0\nvt 0.6875 0 0\nvt 0.6875 1 0\nvt 0.308658 0.03806 0\nvt 0.5 0 0\nvt 0.75 0 0\nvt 0.75 1 0\nvt 0.5 0 0\nvt 0.308658 0.03806 0\nvt 0.8125 0 0\nvt 0.8125 1 0\nvt 0.691342 0.03806 0\nvt 0.146446 0.146447 0\nvt 0.875 0 0\nvt 0.875 1 0\nvt 0.853554 0.146447 0\nvt 0.03806 0.308658 0\nvt 0.9375 0 0\nvt 0.9375 1 0\nvt 0.96194 0.308658 0\n\nf 73/77 69/71 67/69 \nf 74/78 75/79 71/75 70/73 \nf 76/80 68/70 72/76 \nf 77/81 73/77 67/69 \nf 78/82 79/83 75/79 74/78 \nf 80/84 68/70 76/80 \nf 81/85 77/81 67/69 \nf 82/86 83/87 79/83 78/82 \nf 84/88 68/70 80/84 \nf 85/89 81/85 67/69 \nf 86/90 87/91 83/87 82/86 \nf 88/92 68/70 84/88 \nf 89/93 85/89 67/69 \nf 90/94 91/95 87/91 86/90 \nf 92/96 68/70 88/92 \nf 93/97 89/93 67/69 \nf 94/98 95/99 91/95 90/94 \nf 96/100 68/70 92/96 \nf 97/101 93/97 67/69 \nf 98/102 99/103 95/99 94/98 \nf 100/104 68/70 96/100 \nf 101/105 97/101 67/69 \nf 102/106 103/107 99/103 98/102 \nf 104/108 68/70 100/104 \nf 105/109 101/105 67/69 \nf 106/110 107/111 103/107 102/106 \nf 108/112 68/70 104/108 \nf 109/113 105/109 67/69 \nf 110/114 111/115 107/111 106/110 \nf 112/116 68/70 108/112 \nf 113/117 109/113 67/69 \nf 114/118 115/119 111/115 110/114 \nf 116/120 68/70 112/116 \nf 117/121 113/117 67/69 \nf 118/122 119/123 115/119 114/118 \nf 120/124 68/70 116/120 \nf 121/125 117/121 67/69 \nf 122/126 123/127 119/123 118/122 \nf 124/128 68/70 120/124 \nf 125/129 121/125 67/69 \nf 126/130 127/131 123/127 122/126 \nf 128/132 68/70 124/128 \nf 129/133 125/129 67/69 \nf 130/134 131/135 127/131 126/130 \nf 132/136 68/70 128/132 \nf 69/71 129/133 67/69 \nf 70/72 71/74 131/135 130/134 \nf 72/76 68/70 132/136 \n\ng CenterPart Cylinder_Z\nv -0.008281 0 0.904201\nv -0.008281 0 -0.895799\nv 0.441719 0 0.904201\nv 0.441719 0 0.904201\nv 0.441719 0 -0.895799\nv 0.441719 0 -0.895799\nv 0.407465 -0.172208 0.904201\nv 0.407465 -0.172208 0.904201\nv 0.407465 -0.172208 -0.895799\nv 0.407465 -0.172208 -0.895799\nv 0.309917 -0.318198 0.904201\nv 0.309917 -0.318198 0.904201\nv 0.309917 -0.318198 -0.895799\nv 0.309917 -0.318198 -0.895799\nv 0.163927 -0.415746 0.904201\nv 0.163927 -0.415746 0.904201\nv 0.163927 -0.415746 -0.895799\nv 0.163927 -0.415746 -0.895799\nv -0.008281 -0.45 0.904201\nv -0.008281 -0.45 0.904201\nv -0.008281 -0.45 -0.895799\nv -0.008281 -0.45 -0.895799\nv -0.180488 -0.415746 0.904201\nv -0.180488 -0.415746 0.904201\nv -0.180488 -0.415746 -0.895799\nv -0.180488 -0.415746 -0.895799\nv -0.326479 -0.318198 0.904201\nv -0.326479 -0.318198 0.904201\nv -0.326479 -0.318198 -0.895799\nv -0.326479 -0.318198 -0.895799\nv -0.424027 -0.172207 0.904201\nv -0.424027 -0.172207 0.904201\nv -0.424027 -0.172207 -0.895799\nv -0.424027 -0.172207 -0.895799\nv -0.458281 0 0.904201\nv -0.458281 0 0.904201\nv -0.458281 0 -0.895799\nv -0.458281 0 -0.895799\nv -0.424027 0.172208 0.904201\nv -0.424027 0.172208 0.904201\nv -0.424027 0.172208 -0.895799\nv -0.424027 0.172208 -0.895799\nv -0.326479 0.318198 0.904201\nv -0.326479 0.318198 0.904201\nv -0.326479 0.318198 -0.895799\nv -0.326479 0.318198 -0.895799\nv -0.180488 0.415746 0.904201\nv -0.180488 0.415746 0.904201\nv -0.180488 0.415746 -0.895799\nv -0.180488 0.415746 -0.895799\nv -0.008281 0.45 0.904201\nv -0.008281 0.45 0.904201\nv -0.008281 0.45 -0.895799\nv -0.008281 0.45 -0.895799\nv 0.163927 0.415746 0.904201\nv 0.163927 0.415746 0.904201\nv 0.163927 0.415746 -0.895799\nv 0.163927 0.415746 -0.895799\nv 0.309917 0.318198 0.904201\nv 0.309917 0.318198 0.904201\nv 0.309917 0.318198 -0.895799\nv 0.309917 0.318198 -0.895799\nv 0.407465 0.172208 0.904201\nv 0.407465 0.172208 0.904201\nv 0.407465 0.172208 -0.895799\nv 0.407465 0.172208 -0.895799\n\nvt 0.5 0.5 0\nvt 0.5 0.5 0\nvt 0 0.5 0\nvt 1 0 0\nvt 0 0 0\nvt 1 1 0\nvt 0 1 0\nvt 1 0.5 0\nvt 0.03806 0.691342 0\nvt 0.0625 0 0\nvt 0.0625 1 0\nvt 0.96194 0.691342 0\nvt 0.146447 0.853553 0\nvt 0.125 0 0\nvt 0.125 1 0\nvt 0.853553 0.853553 0\nvt 0.308658 0.96194 0\nvt 0.1875 0 0\nvt 0.1875 1 0\nvt 0.691342 0.96194 0\nvt 0.5 1 0\nvt 0.25 0 0\nvt 0.25 1 0\nvt 0.5 1 0\nvt 0.691342 0.96194 0\nvt 0.3125 0 0\nvt 0.3125 1 0\nvt 0.308658 0.96194 0\nvt 0.853553 0.853553 0\nvt 0.375 0 0\nvt 0.375 1 0\nvt 0.146447 0.853553 0\nvt 0.96194 0.691342 0\nvt 0.4375 0 0\nvt 0.4375 1 0\nvt 0.03806 0.691342 0\nvt 1 0.5 0\nvt 0.5 0 0\nvt 0.5 1 0\nvt 0 0.5 0\nvt 0.96194 0.308658 0\nvt 0.5625 0 0\nvt 0.5625 1 0\nvt 0.03806 0.308658 0\nvt 0.853553 0.146447 0\nvt 0.625 0 0\nvt 0.625 1 0\nvt 0.146447 0.146447 0\nvt 0.691342 0.03806 0\nvt 0.6875 0 0\nvt 0.6875 1 0\nvt 0.308658 0.03806 0\nvt 0.5 0 0\nvt 0.75 0 0\nvt 0.75 1 0\nvt 0.5 0 0\nvt 0.308658 0.03806 0\nvt 0.8125 0 0\nvt 0.8125 1 0\nvt 0.691342 0.03806 0\nvt 0.146446 0.146447 0\nvt 0.875 0 0\nvt 0.875 1 0\nvt 0.853554 0.146447 0\nvt 0.03806 0.308658 0\nvt 0.9375 0 0\nvt 0.9375 1 0\nvt 0.96194 0.308658 0\n\nf 139/145 135/139 133/137 \nf 140/146 141/147 137/143 136/141 \nf 142/148 134/138 138/144 \nf 143/149 139/145 133/137 \nf 144/150 145/151 141/147 140/146 \nf 146/152 134/138 142/148 \nf 147/153 143/149 133/137 \nf 148/154 149/155 145/151 144/150 \nf 150/156 134/138 146/152 \nf 151/157 147/153 133/137 \nf 152/158 153/159 149/155 148/154 \nf 154/160 134/138 150/156 \nf 155/161 151/157 133/137 \nf 156/162 157/163 153/159 152/158 \nf 158/164 134/138 154/160 \nf 159/165 155/161 133/137 \nf 160/166 161/167 157/163 156/162 \nf 162/168 134/138 158/164 \nf 163/169 159/165 133/137 \nf 164/170 165/171 161/167 160/166 \nf 166/172 134/138 162/168 \nf 167/173 163/169 133/137 \nf 168/174 169/175 165/171 164/170 \nf 170/176 134/138 166/172 \nf 171/177 167/173 133/137 \nf 172/178 173/179 169/175 168/174 \nf 174/180 134/138 170/176 \nf 175/181 171/177 133/137 \nf 176/182 177/183 173/179 172/178 \nf 178/184 134/138 174/180 \nf 179/185 175/181 133/137 \nf 180/186 181/187 177/183 176/182 \nf 182/188 134/138 178/184 \nf 183/189 179/185 133/137 \nf 184/190 185/191 181/187 180/186 \nf 186/192 134/138 182/188 \nf 187/193 183/189 133/137 \nf 188/194 189/195 185/191 184/190 \nf 190/196 134/138 186/192 \nf 191/197 187/193 133/137 \nf 192/198 193/199 189/195 188/194 \nf 194/200 134/138 190/196 \nf 195/201 191/197 133/137 \nf 196/202 197/203 193/199 192/198 \nf 198/204 134/138 194/200 \nf 135/139 195/201 133/137 \nf 136/140 137/142 197/203 196/202 \nf 138/144 134/138 198/204 \n\n'
        );
        return { };
      });
    'use strict';
    define('PreloadWebglShaders', ['J3DI'],
      function (J3DI) {
        J3DI.setFileData('lib/shaders/texture.frag',
          '/*\n * @(#)texture.frag\n * Copyright (c) 2014 Werner Randelshofer, Switzerland.\n * You may only use this software in accordance with the license terms.\n */\n\n// WebGL Fragment Shader\n#ifdef GL_ES\n    precision mediump float;\n#endif\n\n// World information\n// -----------------\nuniform vec3 camPos;         // camera position in world coordinates\nuniform vec3 lightPos;       // light position in world coordinates\n\n// Model information\n// -----------------\nuniform vec4 mPhong;         // vertex ambient, diffuse, specular, shininess\nuniform sampler2D mTexture;  // texture\nuniform bool mHasTexture; \n\n\n// Fragment information\n// --------------------\nvarying vec4 fColor;\nvarying vec4 fNormal;\nvarying vec4 fPos;\nvarying vec2 fTexture;       // fragment texture cooordinates\n\n\nvoid main() {\n  vec3 wi = normalize(lightPos - fPos.xyz); // direction to light source\n  vec3 wo = normalize(camPos - fPos.xyz); // direction to observer\n  vec3 n = normalize(fNormal.xyz);\n  float specular=pow( max(0.0,-dot(reflect(wi, n), wo)), mPhong.w)*mPhong.z;\n  float diffuse=max(0.0,dot(wi,n))*mPhong.y;\n  float ambient=mPhong.x;\n  \n  vec4 color=(mHasTexture)?texture2D(mTexture, fTexture):fColor;\n  \n  gl_FragColor=vec4(color.rgb*(diffuse+ambient)+specular*vec3(1,1,1), color.a);\n  //gl_FragColor=vec4(n.x,n.y,n.z, color.a);\n}'
        );
        J3DI.setFileData('lib/shaders/texture.vert',
          '/*\n * @(#)texture.vert\n * Copyright (c) 2014 Werner Randelshofer, Switzerland.\n * You may only use this software in accordance with the license terms.\n */\n \n// WebGL Vertex Shader\n#ifdef GL_ES\n    precision mediump float;\n#endif\n\n// World information\n// -----------------\nuniform vec3 camPos;         // camera position in view coordinates\nuniform vec3 lightPos;       // light position in world coordinates\n\n// Model information\n// -----------------\nuniform mat4 mvMatrix;       // model-view matrix\nuniform mat4 mvNormalMatrix; // model-view normal matrix\nuniform mat4 mvpMatrix;      // model-view-perspective matrix\nuniform vec4 mPhong;         // vertex ambient, diffuse, specular, shininess\n\n// Vertex information\n// ------------------\nattribute vec4 vPos;         // vertex position in model coordinates\nattribute vec3 vNormal;      // vertex normal in model coordinates\nattribute vec4 vColor;       // vertex color\nattribute vec2 vTexture;     // vertex texture uv coordinates\n\n// Fragment information\n// ------------------\nvarying vec4 fPos;           // fragment position in view coordinates\nvarying vec4 fColor;         // fragment color\nvarying vec4 fNormal;        // fragment normal in view coordinates\nvarying vec2 fTexture;       // fragment texture cooordinates\n		\nvoid main() {\n fPos = mvMatrix * vPos;\n fNormal = mvNormalMatrix * vec4(vNormal, 1);\n fColor=vColor/255.0;\n gl_Position = mvpMatrix * vPos;\n fTexture=vTexture;\n}\n\n'
        );
        J3DI.setFileData('lib/shaders/phong.frag',
          '/*\n * @(#)phong.frag\n * Copyright (c) 2014 Werner Randelshofer, Switzerland.\n * You may only use this software in accordance with the license terms.\n */\n\n// WebGL Fragment Shader\n#ifdef GL_ES\n    precision mediump float;\n#endif\n\n// World information\n// -----------------\nuniform vec3 camPos;         // camera position in world coordinates\nuniform vec3 lightPos;       // light position in world coordinates\n\n// Model information\n// -----------------\nuniform vec4 mPhong;         // vertex ambient, diffuse, specular, shininess\n\n\n// Fragment information\n// --------------------\nvarying vec4 fColor;\nvarying vec4 fNormal;\nvarying vec4 fPos;\n\n\nvoid main() {\n  vec3 wi = normalize(lightPos - fPos.xyz); // direction to light source\n  vec3 wo = normalize(camPos - fPos.xyz); // direction to observer\n  vec3 n = normalize(fNormal.xyz);\n  float specular=pow( max(0.0,-dot(reflect(wi, n), wo)), mPhong.w)*mPhong.z;\n  float diffuse=max(0.0,dot(wi,n))*mPhong.y;\n  float ambient=mPhong.x;\n\n  gl_FragColor=vec4(fColor.rgb*(diffuse+ambient)+specular*vec3(1,1,1), fColor.a);\n  //gl_FragColor=vec4(n.x,n.y,n.z, fColor.a);\n}\n \n \n'
        );
        J3DI.setFileData('lib/shaders/phong.vert',
          '/*\n * @(#)phong.vert\n * Copyright (c) 2014 Werner Randelshofer, Switzerland.\n * You may only use this software in accordance with the license terms.\n */\n \n// WebGL Vertex Shader\n#ifdef GL_ES\n    precision mediump float;\n#endif\n\n// World information\n// -----------------\nuniform vec3 camPos;         // camera position in view coordinates\nuniform vec3 lightPos;       // light position in world coordinates\n\n// Model information\n// -----------------\nuniform mat4 mvMatrix;       // model-view matrix\nuniform mat4 mvNormalMatrix; // model-view normal matrix\nuniform mat4 mvpMatrix;      // model-view-perspective matrix\nuniform vec4 mPhong;         // vertex ambient, diffuse, specular, shininess\n\n// Vertex information\n// ------------------\nattribute vec4 vPos;         // vertex position in model coordinates\nattribute vec3 vNormal;      // vertex normal in model coordinates\nattribute vec4 vColor;       // vertex color\n\n// Fragment information\n// ------------------\nvarying vec4 fPos;           // fragment position in view coordinates\nvarying vec4 fColor;         // fragment color\nvarying vec4 fNormal;        // fragment normal in view coordinates\n		\nvoid main() {\n fPos = mvMatrix * vPos;\n fNormal = mvNormalMatrix * vec4(vNormal, 1);\n fColor=vColor/255.0;\n gl_Position = mvpMatrix * vPos;\n}\n\n'
        );
        return { };
      });
    'use strict';
    define('RubiksCube', ['Cube'],
      function (Cube) {
        const module = {
          log: (false) ? console.log : () => {},
          info: (true) ? console.info : () => {},
          warning: (true) ? console.warning : () => {},
          error: (true) ? console.error : () => {}
        };
        /**
     * Represents the state of a 3-times sliced cube (Rubik's Cube) by the location
     * and orientation of its parts.
     * <p>
     * A Rubik's Cube has 8 corner parts, 12 edge parts, 6 face parts and one
     * center part. The parts divide each face of the cube into 3 x 3 layers.
     * <p>
     * <b>Corner parts</b>
     * <p>
     * The following diagram shows the initial orientations and locations of
     * the corner parts:
     * <pre>
     *             +---+---+---+
     *             |4.0|   |2.0|
     *             +---     ---+
     *             |     1     |
     *             +---     ---+
     *             |6.0|   |0.0|
     * +---+---+---+---+---+---+---+---+---+---+---+---+
     * |4.1|   |6.2|6.1|   |0.2|0.1|   |2.2|2.1|   |4.2|
     * +---     ---+---     ---+---    +---+---     ---+
     * |     3     |     2     |     0     |     5     |
     * +---     ---+---     ---+---    +---+---     ---+
     * |5.2|   |7.1|7.2|   |1.1|1.2|   |3.1|3.2|   |5.1|
     * +---+---+---+---+---+---+---+---+---+---+---+---+
     *             |7.0|   |1.0|
     *             +---     ---+
     *             |     4     |
     *             +---     ---+
     *             |5.0|   |3.0|
     *             +---+---+---+
     * </pre>
     * <p>
     * <b>Edge parts</b>
     * <p>
     * The following diagram shows the initial orientations and locations of
     * the edge parts:
     * <pre>
     *             +---+---+---+
     *             |   |3.1|   |
     *             +--- --- ---+
     *             |6.0| 1 |0.0|
     *             +--- --- ---+
     *             |   |9.1|   |
     * +---+---+---+---+---+---+---+---+---+---+---+---+
     * |   |6.1|   |   |9.0|   |   |0.1|   |   |3.0|   |
     * +--- --- ---+--- --- ---+--- --- ---+--- --- ---+
     * |7.0| 3 10.0|10.1 2 |1.1|1.0| 0 |4.0|4.1| 5 |7.1|
     * +--- --- ---+--- --- ---+--- --- ---+--- --- ---+
     * |   |8.1|   |   |11.0   |   |2.1|   |   |5.0|   |
     * +---+---+---+---+---+---+---+---+---+---+---+---+
     *             |   |11.1   |
     *             +--- --- ---+
     *             |8.0| 4 |2.0|
     *             +--- --- ---+
     *             |   |5.1|   |
     *             +---+---+---+
     * </pre>
     * <p>
     * <b>Side parts</b>
     * <p>
     * The following diagram shows the initial orientation and location of
     * the face parts:
     * <pre>
     *             +------------+
     *             |     .1     |
     *             |    ---     |
     *             | .0| 1 |.2  |
     *             |    ---     |
     *             |     .3     |
     * +-----------+------------+-----------+-----------+
     * |     .0    |     .2     |     .3    |    .1     |
     * |    ---    |    ---     |    ---    |    ---    |
     * | .3| 3 |.1 | .1| 2 |.3  | .2| 0 |.0 | .0| 5 |.2 |
     * |    ---    |    ---     |    ---    |    ---    |
     * |     .2    |    .0      |     .1    |     .3    |
     * +-----------+------------+-----------+-----------+
     *             |     .0     |
     *             |    ---     |
     *             | .3| 4 |.1  |
     *             |    ---     |
     *             |     .2     |
     *             +------------+
     * </pre>
     * <p>
     * For more information about the location and orientation of the parts see
     * {@link Cube}.
     * <p>
     * <b>Stickers</b>
     * <p>
     * The following diagram shows the arrangement of stickers on a Rubik's Cube:
     * The number before the comma is the first dimension (faces), the number
     * after the comma is the second dimension (stickers).
     * <pre>
     *             +---+---+---+
     *             |1,0|1,1|1,2|
     *             +--- --- ---+
     *             |1,3|1,4|1,5|
     *             +--- --- ---+
     *             |1,6|1,7|1,8|
     * +---+---+---+---+---+---+---+---+---+---+---+---+
     * |3,0|3,1|3,2|2,0|2,1|2,2|0,0|0,1|0,2|5,0|5,1|5,2|
     * +--- --- ---+--- --- ---+--- --- ---+--- --- ---+
     * |3,3|3,4|3,5|2,3|2,4|2,5|0,3|0,4|0,5|5,3|5,4|5,5|
     * +--- --- ---+--- --- ---+--- --- ---+--- --- ---+
     * |3,6|3,7|3,8|2,6|2,7|2,8|0,6|0,7|0,8|5,6|5,7|5,8|
     * +---+---+---+---+---+---+---+---+---+---+---+---+
     *             |4,0|4,1|4,2|
     *             +--- --- ---+
     *             |4,3|4,4|4,5|
     *             +--- --- ---+
     *             |4,6|4,7|4,8|
     *             +---+---+---+
     * </pre>
     */
        class RubiksCube extends Cube.Cube {
          constructor() {
            super(3);
            this.reset();
          }

          getPartLayerMask(part, orientation) {
            const face = this.getPartFace(part, orientation);
            if (part < this.cornerLoc.length) {
              return (face < 3) ? 4 : 1;
            } else if (part < this.cornerLoc.length + this.edgeLoc.length) {
              return 2;
            } else if (part < this.cornerLoc.length + this.edgeLoc.length + this.sideLoc.length) {
              return (face < 3) ? 4 : 1;
            } else {
              return 0;
            }
          }

          getPartSwipeAxis(part, orientation, swipeDirection) {
            if (part < this.cornerLoc.length) {
              var loc = this.getCornerLocation(part);
              var ori = (3 - this.getPartOrientation(part) + orientation) % 3;
              return this.CORNER_SWIPE_TABLE[loc][ori][swipeDirection][0];
            } else if (part < this.cornerLoc.length + this.edgeLoc.length) {
              const edgeIndex = part - this.cornerLoc.length;
              var loc = this.getEdgeLocation(edgeIndex);
              var ori = (2 - this.getPartOrientation(part) + orientation) % 2;
              return this.EDGE_SWIPE_TABLE[loc][ori][swipeDirection][0];
            } else if (part < this.cornerLoc.length + this.edgeLoc.length + this.sideLoc.length) {
              var loc = this.getSideLocation(part - this.cornerLoc.length - this.edgeLoc.length);
              var ori = (4 - this.getPartOrientation(part) + swipeDirection) % 4;
              return this.SIDE_SWIPE_TABLE[loc][ori][0];
            } else {
              return -1;
            }
          }

          getPartSwipeLayerMask(part, orientation, swipeDirection) {
            if (part < this.cornerLoc.length) {
              var loc = this.getCornerLocation(part);
              var ori = (3 - this.getPartOrientation(part) + orientation) % 3;
              return this.CORNER_SWIPE_TABLE[loc][ori][swipeDirection][1];
            } else if (part < this.cornerLoc.length + this.edgeLoc.length) {
              const edgeIndex = part - this.cornerLoc.length;
              var loc = this.getEdgeLocation(edgeIndex);
              var ori = (2 - this.getPartOrientation(part) + orientation) % 2;
              return this.EDGE_SWIPE_TABLE[loc][ori][swipeDirection][1];
            } else if (part < this.cornerLoc.length + this.edgeLoc.length + this.sideLoc.length) {
              var loc = this.getSideLocation(part - this.cornerLoc.length - this.edgeLoc.length);
              var ori = (4 - this.getPartOrientation(part) + swipeDirection) % 4;
              return this.SIDE_SWIPE_TABLE[loc][ori][1];
            } else {
              return 0;
            }
          }

          getPartSwipeAngle(part, orientation, swipeDirection) {
            if (part < this.cornerLoc.length) {
              var loc = this.getCornerLocation(part);
              var ori = this.getPartOrientation(part);
              var sori = (3 - ori + orientation) % 3;
              var dir = swipeDirection;
              var angle = this.CORNER_SWIPE_TABLE[loc][sori][dir][2];
              if (ori == 2 && (sori == 0 || sori == 2)) {
                angle = -angle;
              } else if (ori == 1 && (sori == 1 || sori == 2)) {
                angle = -angle;
              }
              return angle;
            } else if (part < this.cornerLoc.length + this.edgeLoc.length) {
              const edgeIndex = part - this.cornerLoc.length;
              var loc = this.getEdgeLocation(edgeIndex);
              var ori = this.getEdgeOrientation(edgeIndex);
              var sori = (2 - ori + orientation) % 2;
              var dir = swipeDirection;
              var angle = this.EDGE_SWIPE_TABLE[loc][sori][dir][2];
              return angle;
            } else if (part < this.cornerLoc.length + this.edgeLoc.length + this.sideLoc.length) {
              var loc = this.getSideLocation(part - this.cornerLoc.length - this.edgeLoc.length);
              var ori = (4 - this.getPartOrientation(part) + swipeDirection) % 4;
              return this.SIDE_SWIPE_TABLE[loc][ori][2];
            } else {
              return 0;
            }
          }

          transform0(axis, layerMask, angle) {
            module.log('RubiksCube#' + (this) + '.transform(ax=' + axis + ',msk=' + layerMask + ',ang:' + angle + ')');
            {
              if (axis < 0 || axis > 2) {
                throw ('axis: ' + axis);
              }
              if (layerMask < 0 || layerMask >= 1 << this.layerCount) {
                throw ('layerMask: ' + layerMask);
              }
              if (angle < -2 || angle > 2) {
                throw ('angle: ' + angle);
              }
              if (angle == 0) {
                return;
              }
              const an = (angle == -2) ? 2 : angle;
              if ((layerMask & 1) != 0) {
                switch (axis) {
                  case 0:
                    switch (an) {
                      case -1:
                        this.twistL();
                        break;
                      case 1:
                        this.twistL();
                        this.twistL();
                        this.twistL();
                        break;
                      case 2:
                        this.twistL();
                        this.twistL();
                        break;
                    }
                    break;
                  case 1:
                    switch (an) {
                      case -1:
                        this.twistD();
                        break;
                      case 1:
                        this.twistD();
                        this.twistD();
                        this.twistD();
                        break;
                      case 2:
                        this.twistD();
                        this.twistD();
                        break;
                    }
                    break;
                  case 2:
                    switch (an) {
                      case -1:
                        this.twistB();
                        break;
                      case 1:
                        this.twistB();
                        this.twistB();
                        this.twistB();
                        break;
                      case 2:
                        this.twistB();
                        this.twistB();
                        break;
                    }
                }
              }
              if ((layerMask & 2) != 0) {
                switch (axis) {
                  case 0:
                    switch (an) {
                      case 1:
                        this.twistMR();
                        break;
                      case -1:
                        this.twistMR();
                        this.twistMR();
                        this.twistMR();
                        break;
                      case 2:
                        this.twistMR();
                        this.twistMR();
                        break;
                    }
                    break;
                  case 1:
                    switch (an) {
                      case 1:
                        this.twistMU();
                        break;
                      case -1:
                        this.twistMU();
                        this.twistMU();
                        this.twistMU();
                        break;
                      case 2:
                        this.twistMU();
                        this.twistMU();
                        break;
                    }
                    break;
                  case 2:
                    switch (an) {
                      case 1:
                        this.twistMF();
                        break;
                      case -1:
                        this.twistMF();
                        this.twistMF();
                        this.twistMF();
                        break;
                      case 2:
                        this.twistMF();
                        this.twistMF();
                        break;
                    }
                }
              }
              if ((layerMask & 4) != 0) {
                switch (axis) {
                  case 0:
                    switch (an) {
                      case 1:
                        this.twistR();
                        break;
                      case -1:
                        this.twistR();
                        this.twistR();
                        this.twistR();
                        break;
                      case 2:
                        this.twistR();
                        this.twistR();
                        break;
                    }
                    break;
                  case 1:
                    switch (an) {
                      case 1:
                        this.twistU();
                        break;
                      case -1:
                        this.twistU();
                        this.twistU();
                        this.twistU();
                        break;
                      case 2:
                        this.twistU();
                        this.twistU();
                        break;
                    }
                    break;
                  case 2:
                    switch (an) {
                      case 1:
                        this.twistF();
                        break;
                      case -1:
                        this.twistF();
                        this.twistF();
                        this.twistF();
                        break;
                      case 2:
                        this.twistF();
                        this.twistF();
                        break;
                    }
                }
              }
            }
          }

          twistR() {
            this.fourCycle(this.cornerLoc, 0, 1, 3, 2, this.cornerOrient, 1, 2, 1, 2, 3);
            this.fourCycle(this.edgeLoc, 0, 1, 2, 4, this.edgeOrient, 1, 1, 1, 1, 2);
            this.sideOrient[0] = (this.sideOrient[0] + 3) % 4;
          }

          twistU() {
            this.fourCycle(this.cornerLoc, 0, 2, 4, 6, this.cornerOrient, 0, 0, 0, 0, 3);
            this.fourCycle(this.edgeLoc, 0, 3, 6, 9, this.edgeOrient, 1, 1, 1, 1, 2);
            this.sideOrient[1] = (this.sideOrient[1] + 3) % 4;
          }

          twistF() {
            this.fourCycle(this.cornerLoc, 6, 7, 1, 0, this.cornerOrient, 1, 2, 1, 2, 3);
            this.fourCycle(this.edgeLoc, 9, 10, 11, 1, this.edgeOrient, 1, 1, 1, 1, 2);
            this.sideOrient[2] = (this.sideOrient[2] + 3) % 4;
          }

          twistL() {
            this.fourCycle(this.cornerLoc, 6, 4, 5, 7, this.cornerOrient, 2, 1, 2, 1, 3);
            this.fourCycle(this.edgeLoc, 6, 7, 8, 10, this.edgeOrient, 1, 1, 1, 1, 2);
            this.sideOrient[3] = (this.sideOrient[3] + 3) % 4;
          }

          twistD() {
            this.fourCycle(this.cornerLoc, 7, 5, 3, 1, this.cornerOrient, 0, 0, 0, 0, 3);
            this.fourCycle(this.edgeLoc, 2, 11, 8, 5, this.edgeOrient, 1, 1, 1, 1, 2);
            this.sideOrient[4] = (this.sideOrient[4] + 3) % 4;
          }

          twistB() {
            this.fourCycle(this.cornerLoc, 2, 3, 5, 4, this.cornerOrient, 1, 2, 1, 2, 3);
            this.fourCycle(this.edgeLoc, 3, 4, 5, 7, this.edgeOrient, 1, 1, 1, 1, 2);
            this.sideOrient[5] = (this.sideOrient[5] + 3) % 4;
          }

          twistMR() {
            this.fourCycle(this.edgeLoc, 3, 9, 11, 5, this.edgeOrient, 1, 1, 1, 1, 2);
            this.fourCycle(this.sideLoc, 2, 4, 5, 1, this.sideOrient, 2, 3, 2, 1, 4);
          }

          twistMU() {
            this.fourCycle(this.edgeLoc, 1, 4, 7, 10, this.edgeOrient, 1, 1, 1, 1, 2);
            this.fourCycle(this.sideLoc, 3, 2, 0, 5, this.sideOrient, 2, 1, 2, 3, 4);
          }

          twistMF() {
            this.fourCycle(this.edgeLoc, 0, 6, 8, 2, this.edgeOrient, 1, 1, 1, 1, 2);
            this.fourCycle(this.sideLoc, 0, 1, 3, 4, this.sideOrient, 1, 2, 3, 2, 4);
          }

          toStickers() {
            const stickers = new Array(6);
            for (var i = 0; i < 6; i++) {
              stickers[i] = new Array(9);
            }
            for (var i = 0; i < 6; i++) {
              var loc = this.sideLoc[i];
              stickers[this.SIDE_TRANSLATION[i][0]][this.SIDE_TRANSLATION[i][1]] = this.SIDE_TRANSLATION[loc][0];
            }
            for (var i = 0; i < 12; i++) {
              var loc = this.edgeLoc[i];
              var orient = this.edgeOrient[i];
              stickers[this.EDGE_TRANSLATION[i][0]][this.EDGE_TRANSLATION[i][1]] =
          (orient == 0) ? this.EDGE_TRANSLATION[loc][0] : this.EDGE_TRANSLATION[loc][2];
              stickers[this.EDGE_TRANSLATION[i][2]][this.EDGE_TRANSLATION[i][3]] =
          (orient == 0) ? this.EDGE_TRANSLATION[loc][2] : this.EDGE_TRANSLATION[loc][0];
            }
            for (var i = 0; i < 8; i++) {
              var loc = this.cornerLoc[i];
              var orient = this.cornerOrient[i];
              stickers[this.CORNER_TRANSLATION[i][0]][this.CORNER_TRANSLATION[i][1]] =
          (orient == 0)
            ? this.CORNER_TRANSLATION[loc][0]
            : ((orient == 1)
                ? this.CORNER_TRANSLATION[loc][2]
                : this.CORNER_TRANSLATION[loc][4]);
              stickers[this.CORNER_TRANSLATION[i][2]][this.CORNER_TRANSLATION[i][3]] =
          (orient == 0)
            ? this.CORNER_TRANSLATION[loc][2]
            : ((orient == 1)
                ? this.CORNER_TRANSLATION[loc][4]
                : this.CORNER_TRANSLATION[loc][0]);
              stickers[this.CORNER_TRANSLATION[i][4]][this.CORNER_TRANSLATION[i][5]] =
          (orient == 0)
            ? this.CORNER_TRANSLATION[loc][4]
            : ((orient == 1)
                ? this.CORNER_TRANSLATION[loc][0]
                : this.CORNER_TRANSLATION[loc][2]);
            }
            return stickers;
          }

          setToStickers(stickers) {
            let i = 0; let j = 0; let cube;
            const tempSideLoc = new Array(6);
            const tempSideOrient = new Array(6);
            const tempEdgeLoc = new Array(12);
            const tempEdgeOrient = new Array(12);
            const tempCornerLoc = new Array(8);
            const tempCornerOrient = new Array(8);
            try {
              for (i = 0; i < 6; i++) {
                for (j = 0; j < 6; j++) {
                  if (this.SIDE_TRANSLATION[j][0] == stickers[i][this.SIDE_TRANSLATION[j][1]]) {
                    tempSideLoc[i] = this.SIDE_TRANSLATION[j][0];
                    break;
                  }
                }
              }
            } catch (e) {
              throw ('Invalid side cube ' + i);
            }
            for (i = 0; i < 5; i++) {
              for (j = i + 1; j < 6; j++) {
                if (tempSideLoc[i] == tempSideLoc[j]) {
                  throw ('Duplicate side cubes ' + i + '+' + j);
                }
              }
            }
            for (i = 0; i < 12; i++) {
              var f0 = stickers[this.EDGE_TRANSLATION[i][0]][this.EDGE_TRANSLATION[i][1]];
              var f1 = stickers[this.EDGE_TRANSLATION[i][2]][this.EDGE_TRANSLATION[i][3]];
              for (cube = 0; cube < 12; cube++) {
                if (this.EDGE_TRANSLATION[cube][0] == f0 &&
            this.EDGE_TRANSLATION[cube][2] == f1) {
                  tempEdgeOrient[i] = 0;
                  break;
                } else if (this.EDGE_TRANSLATION[cube][0] == f1 &&
            this.EDGE_TRANSLATION[cube][2] == f0) {
                  tempEdgeOrient[i] = 1;
                  break;
                }
              }
              if (cube == 12) {
                throw new Error('Invalid edge cube ' + i);
              }
              tempEdgeLoc[i] = cube;
            }
            for (i = 0; i < 11; i++) {
              for (j = i + 1; j < 12; j++) {
                if (tempEdgeLoc[i] == tempEdgeLoc[j]) {
                  throw new Error('Duplicate edge cubes tempEdgeLoc[' + i + ']=' + tempEdgeLoc[i] + ' tempEdgeLoc[' + j + ']=' + tempEdgeLoc[j]);
                }
              }
            }
            for (i = 0; i < 8; i++) {
              var f0 = stickers[this.CORNER_TRANSLATION[i][0]][this.CORNER_TRANSLATION[i][1]];
              var f1 = stickers[this.CORNER_TRANSLATION[i][2]][this.CORNER_TRANSLATION[i][3]];
              const f2 = stickers[this.CORNER_TRANSLATION[i][4]][this.CORNER_TRANSLATION[i][5]];
              for (cube = 0; cube < 8; cube++) {
                if (this.CORNER_TRANSLATION[cube][0] == f0 &&
            this.CORNER_TRANSLATION[cube][2] == f1 &&
            this.CORNER_TRANSLATION[cube][4] == f2) {
                  tempCornerOrient[i] = 0;
                  break;
                } else if (this.CORNER_TRANSLATION[cube][0] == f2 &&
            this.CORNER_TRANSLATION[cube][2] == f0 &&
            this.CORNER_TRANSLATION[cube][4] == f1) {
                  tempCornerOrient[i] = 1;
                  break;
                } else if (this.CORNER_TRANSLATION[cube][0] == f1 &&
            this.CORNER_TRANSLATION[cube][2] == f2 &&
            this.CORNER_TRANSLATION[cube][4] == f0) {
                  tempCornerOrient[i] = 2;
                  break;
                }
              }
              if (cube == 8) {
                throw new Error('Invalid corner cube ' + i);
              }
              tempCornerLoc[i] = cube;
            }
            for (i = 0; i < 7; i++) {
              for (j = i + 1; j < 8; j++) {
                if (tempCornerLoc[i] == tempCornerLoc[j]) {
                  throw new Error('Duplicate corner cubes tempCornerLoc[' + i + ']=' + tempCornerLoc[i] + ' tempCornerLoc[' + j + ']=' + tempCornerLoc[j]);
                }
              }
            }
            this.sideLoc = tempSideLoc;
            this.sideOrient = tempSideOrient;
            this.edgeLoc = tempEdgeLoc;
            this.edgeOrient = tempEdgeOrient;
            this.cornerLoc = tempCornerLoc;
            this.cornerOrient = tempCornerOrient;
            if (!isQuiet()) {
              fireCubeChanged(new CubeEvent(this, 0, 0, 0));
            }
          }

          clone() {
            const that = new RubiksCube();
            that.setTo(this);
            return that;
          }
        }
        RubiksCube.prototype.DEBUG = false;
        RubiksCube.prototype.NUMBER_OF_SIDE_PARTS = 6;
        RubiksCube.prototype.NUMBER_OF_EDGE_PARTS = 12;
        RubiksCube.prototype.SIDE_TRANSLATION = [
          [0, 4],
          [1, 4],
          [2, 4],
          [3, 4],
          [4, 4],
          [5, 4]
        ];
        RubiksCube.prototype.EDGE_TRANSLATION = [
          [1, 5, 0, 1],
          [0, 3, 2, 5],
          [4, 5, 0, 7],
          [5, 1, 1, 1],
          [0, 5, 5, 3],
          [5, 7, 4, 7],
          [1, 3, 3, 1],
          [3, 3, 5, 5],
          [4, 3, 3, 7],
          [2, 1, 1, 7],
          [3, 5, 2, 3],
          [2, 7, 4, 1]
        ];
        RubiksCube.prototype.CORNER_TRANSLATION = [
          [1, 8, 0, 0, 2, 2],
          [4, 2, 2, 8, 0, 6],
          [1, 2, 5, 0, 0, 2],
          [4, 8, 0, 8, 5, 6],
          [1, 0, 3, 0, 5, 2],
          [4, 6, 5, 8, 3, 6],
          [1, 6, 2, 0, 3, 2],
          [4, 0, 3, 8, 2, 6]
        ];
        RubiksCube.prototype.EDGE_SWIPE_TABLE = [
          [
            [
              [2, 2, 1],
              [0, 4, -1],
              [2, 2, -1],
              [0, 4, 1]
            ],
            [
              [2, 2, -1],
              [1, 4, -1],
              [2, 2, 1],
              [1, 4, 1]
            ]],
          [
            [
              [1, 2, 1],
              [2, 4, -1],
              [1, 2, -1],
              [2, 4, 1]
            ],
            [
              [1, 2, -1],
              [0, 4, -1],
              [1, 2, 1],
              [0, 4, 1]
            ]],
          [
            [
              [2, 2, -1],
              [0, 4, -1],
              [2, 2, 1],
              [0, 4, 1]
            ],
            [
              [2, 2, 1],
              [1, 1, 1],
              [2, 2, -1],
              [1, 1, -1]
            ]],
          [
            [
              [0, 2, -1],
              [1, 4, -1],
              [0, 2, 1],
              [1, 4, 1]
            ],
            [
              [0, 2, 1],
              [2, 1, 1],
              [0, 2, -1],
              [2, 1, -1]
            ]],
          [
            [
              [1, 2, -1],
              [2, 1, 1],
              [1, 2, 1],
              [2, 1, -1]
            ],
            [
              [1, 2, 1],
              [0, 4, -1],
              [1, 2, -1],
              [0, 4, 1]
            ]],
          [
            [
              [0, 2, 1],
              [1, 1, 1],
              [0, 2, -1],
              [1, 1, -1]
            ],
            [
              [0, 2, -1],
              [2, 1, 1],
              [0, 2, 1],
              [2, 1, -1]
            ]],
          [
            [
              [2, 2, -1],
              [0, 1, 1],
              [2, 2, 1],
              [0, 1, -1]
            ],
            [
              [2, 2, 1],
              [1, 4, -1],
              [2, 2, -1],
              [1, 4, 1]
            ]],
          [
            [
              [1, 2, 1],
              [2, 1, 1],
              [1, 2, -1],
              [2, 1, -1]
            ],
            [
              [1, 2, -1],
              [0, 1, 1],
              [1, 2, 1],
              [0, 1, -1]
            ]],
          [
            [
              [2, 2, 1],
              [0, 1, 1],
              [2, 2, -1],
              [0, 1, -1]
            ],
            [
              [2, 2, -1],
              [1, 1, 1],
              [2, 2, 1],
              [1, 1, -1]
            ]],
          [
            [
              [0, 2, 1],
              [1, 4, -1],
              [0, 2, -1],
              [1, 4, 1]
            ],
            [
              [0, 2, -1],
              [2, 4, -1],
              [0, 2, 1],
              [2, 4, 1]
            ]],
          [
            [
              [1, 2, -1],
              [2, 4, -1],
              [1, 2, 1],
              [2, 4, 1]
            ],
            [
              [1, 2, 1],
              [0, 1, 1],
              [1, 2, -1],
              [0, 1, -1]
            ]],
          [
            [
              [0, 2, -1],
              [1, 1, 1],
              [0, 2, 1],
              [1, 1, -1]
            ],
            [
              [0, 2, 1],
              [2, 4, -1],
              [0, 2, -1],
              [2, 4, 1]
            ]]
        ];
        RubiksCube.prototype.SIDE_SWIPE_TABLE = [
          [
            [1, 2, -1],
            [2, 2, 1],
            [1, 2, 1],
            [2, 2, -1]
          ],
          [
            [2, 2, -1],
            [0, 2, 1],
            [2, 2, 1],
            [0, 2, -1]
          ],
          [
            [0, 2, -1],
            [1, 2, 1],
            [0, 2, 1],
            [1, 2, -1]
          ],
          [
            [2, 2, 1],
            [1, 2, -1],
            [2, 2, -1],
            [1, 2, 1]
          ],
          [
            [0, 2, 1],
            [2, 2, -1],
            [0, 2, -1],
            [2, 2, 1]
          ],
          [
            [1, 2, 1],
            [0, 2, -1],
            [1, 2, -1],
            [0, 2, 1]
          ]
        ];
        const cornerParts = ['urf', 'dfr', 'ubr', 'drb', 'ulb', 'dbl', 'ufl', 'dlf'];
        const edgeParts = ['ur', 'rf', 'dr', 'bu', 'rb', 'bd', 'ul', 'lb', 'dl', 'fu', 'lf', 'fd'];
        const sideParts = ['r', 'u', 'f', 'l', 'd', 'b'];
        const partMap = { center: 8 + 12 + 6 };
        for (let i = 0; i < cornerParts.length; i++) {
          const name = cornerParts[i];
          const key1 = name.charAt(0) + name.charAt(1) + name.charAt(2);
          const key2 = name.charAt(0) + name.charAt(2) + name.charAt(1);
          const key3 = name.charAt(1) + name.charAt(0) + name.charAt(2);
          const key4 = name.charAt(1) + name.charAt(2) + name.charAt(0);
          const key5 = name.charAt(2) + name.charAt(0) + name.charAt(1);
          const key6 = name.charAt(2) + name.charAt(1) + name.charAt(0);
          partMap[key1] = i;
          partMap[key2] = i;
          partMap[key3] = i;
          partMap[key4] = i;
          partMap[key5] = i;
          partMap[key6] = i;
        }
        for (let i = 0; i < edgeParts.length; i++) {
          const name = edgeParts[i];
          const key1 = name.charAt(0) + name.charAt(1);
          const key2 = name.charAt(1) + name.charAt(0);
          partMap[key1] = i + 8;
          partMap[key2] = i + 8;
        }
        for (let i = 0; i < sideParts.length; i++) {
          const name = sideParts[i];
          const key1 = name;
          partMap[key1] = i + 8 + 12;
        }
        RubiksCube.prototype.NAME_PART_MAP = partMap;
        return {
          RubiksCube: RubiksCube,
          newRubiksCube: function () {
            return new RubiksCube();
          }
        };
      });
    'use strict';
    define('RubiksCubeS1Cube3D', ['AbstractRubiksCubeCube3D', 'CubeAttributes', 'PreloadRubiksCubeS1'],
      function (AbstractRubiksCubeCube3D, CubeAttributes, PreloadRubiksCubeS1) {
        class RubiksCubeS1Cube3D extends AbstractRubiksCubeCube3D.AbstractRubiksCubeCube3D {
          constructor() {
            super(1.8);
          }

          loadGeometry() {
            super.loadGeometry();
          }

          getModelUrl() {
            return this.baseUrl + '/' + this.relativeUrl;
          }

          createAttributes() {
            const a = CubeAttributes.newCubeAttributes(this.partCount, 6 * 9, [9, 9, 9, 9, 9, 9]);
            const partsPhong = [0.5, 0.6, 0.4, 16.0];
            for (var i = 0; i < this.partCount; i++) {
              a.partsFillColor[i] = [24, 24, 24, 255];
              a.partsPhong[i] = partsPhong;
            }
            a.partsFillColor[this.centerOffset] = [240, 240, 240, 255];
            const faceColors = [
              [255, 210, 0, 155],
              [0, 51, 115, 255],
              [140, 0, 15, 255],
              [248, 248, 248, 255],
              [0, 115, 47, 255],
              [255, 70, 0, 255]
            ];
            const stickersPhong = [0.8, 0.2, 0.1, 8.0];
            for (var i = 0; i < 6; i++) {
              for (let j = 0; j < 9; j++) {
                a.stickersFillColor[i * 9 + j] = faceColors[i];
                a.stickersPhong[i * 9 + j] = stickersPhong;
              }
            }
            a.faceCount = 6;
            a.stickerOffsets = [0, 9, 18, 27, 36, 45];
            a.stickerCounts = [9, 9, 9, 9, 9, 9];
            return a;
          }
        }
        RubiksCubeS1Cube3D.prototype.relativeUrl = 'models/rubikscubes1/';
        RubiksCubeS1Cube3D.prototype.baseUrl = 'lib/';
        return {
          Cube3D: RubiksCubeS1Cube3D,
          newCube3D: function () { const c = new RubiksCubeS1Cube3D(); c.loadGeometry(); return c; }
        };
      });
    'use strict';
    define('RubiksCubeS4Cube3D', ['AbstractRubiksCubeCube3D', 'CubeAttributes', 'PreloadRubiksCubeS4'],
      function (AbstractRubiksCubeCube3D, CubeAttributes, PreloadRubiksCubeS4) {
        class RubiksCubeS4Cube3D extends AbstractRubiksCubeCube3D.AbstractRubiksCubeCube3D {
          constructor() {
            super(1.8);
          }

          loadGeometry() {
            super.loadGeometry();
            this.isDrawTwoPass = false;
          }

          getModelUrl() {
            return this.baseUrl + '/' + this.relativeUrl;
          }

          createAttributes() {
            const a = CubeAttributes.newCubeAttributes(this.partCount, 6 * 9, [9, 9, 9, 9, 9, 9]);
            const partsPhong = [0.5, 0.6, 0.4, 16.0];
            for (var i = 0; i < this.partCount; i++) {
              a.partsFillColor[i] = [24, 24, 24, 255];
              a.partsPhong[i] = partsPhong;
            }
            a.partsFillColor[this.centerOffset] = [240, 240, 240, 255];
            const faceColors = [
              [255, 210, 0, 155],
              [0, 51, 115, 255],
              [140, 0, 15, 255],
              [248, 248, 248, 255],
              [0, 115, 47, 255],
              [255, 70, 0, 255]
            ];
            const stickersPhong = [0.8, 0.2, 0.1, 8.0];
            for (var i = 0; i < 6; i++) {
              for (let j = 0; j < 9; j++) {
                a.stickersFillColor[i * 9 + j] = faceColors[i];
                a.stickersPhong[i * 9 + j] = stickersPhong;
              }
            }
            a.faceCount = 6;
            a.stickerOffsets = [0, 9, 18, 27, 36, 45];
            a.stickerCounts = [9, 9, 9, 9, 9, 9];
            return a;
          }
        }
        RubiksCubeS4Cube3D.prototype.relativeUrl = 'models/rubikscubes4/';
        RubiksCubeS4Cube3D.prototype.baseUrl = 'lib/';
        return {
          Cube3D: RubiksCubeS4Cube3D,
          newCube3D: function () { const c = new RubiksCubeS4Cube3D(); c.loadGeometry(); return c; }
        };
      });
    'use strict';
    define('RubiksCubeS5Cube3D', ['AbstractRubiksCubeCube3D', 'CubeAttributes', 'PreloadRubiksCubeS4'],
      function (AbstractRubiksCubeCube3D, CubeAttributes, PreloadRubiksCubeS4) {
        class RubiksCubeS5Cube3D extends AbstractRubiksCubeCube3D.AbstractRubiksCubeCube3D {
          constructor() {
            super(1.8);
          }

          loadGeometry() {
            super.loadGeometry();
            this.isDrawTwoPass = false;
          }

          getModelUrl() {
            return this.baseUrl + '/' + this.relativeUrl;
          }

          createAttributes() {
            const a = CubeAttributes.newCubeAttributes(this.partCount, 6 * 9, [9, 9, 9, 9, 9, 9]);
            const partsPhong = [0.5, 0.6, 0.4, 16.0];
            for (var i = 0; i < this.partCount; i++) {
              a.partsFillColor[i] = [24, 24, 24, 255];
              a.partsPhong[i] = partsPhong;
            }
            a.partsFillColor[this.centerOffset] = [240, 240, 240, 255];
            const faceColors = [
              [255, 210, 0, 155],
              [0, 51, 115, 255],
              [140, 0, 15, 255],
              [248, 248, 248, 255],
              [0, 115, 47, 255],
              [255, 70, 0, 255]
            ];
            const stickersPhong = [0.8, 0.2, 0.1, 8.0];
            for (var i = 0; i < 6; i++) {
              for (let j = 0; j < 9; j++) {
                a.stickersFillColor[i * 9 + j] = faceColors[i];
                a.stickersPhong[i * 9 + j] = stickersPhong;
              }
            }
            a.faceCount = 6;
            a.stickerOffsets = [0, 9, 18, 27, 36, 45];
            a.stickerCounts = [9, 9, 9, 9, 9, 9];
            return a;
          }
        }
        RubiksCubeS5Cube3D.prototype.relativeUrl = 'models/rubikscubes5/';
        RubiksCubeS5Cube3D.prototype.baseUrl = 'lib/';
        return {
          Cube3D: RubiksCubeS5Cube3D,
          newCube3D: function () { const c = new RubiksCubeS5Cube3D(); c.loadGeometry(); return c; }
        };
      });
    'use strict';
    define('ScriptAST', ['ScriptNotation'],
      function (ScriptNotation) {
        const Symbol = ScriptNotation.Symbol;
        class Node {
          constructor(layerCount, startPosition, endPosition) {
            this.children = [];
            this.parent = null;
            this.layerCount = layerCount;
            this.startPostion = startPosition;
            this.endPosition = endPosition;
          }

          add(child) {
            if (child.parent != null) {
              child.removeFromParent();
            }
            child.parent = this;
            this.children.push(child);
          }

          remove(child) {
            if (child.parent == this) {
              const index = this.children.indexOf(child);
              if (index != -1) {
                this.children.splice(index, 1);
              }
              child.parent = null;
            }
          }

          removeFromParent() {
            if (this.parent != null) {
              this.parent.remove(this);
            }
          }

          getChildCount() {
            return this.children.length;
          }

          getChildAt(index) {
            return this.children[index];
          }

          setStartPosition(newValue) {
            this.startPosition = newValue;
          }

          setEndPosition(newValue) {
            this.endPosition = newValue;
          }

          getStartPosition() {
            return this.startPosition;
          }

          getEndPosition() {
            return this.endPosition;
          }

          applyTo(cube) {
            for (let i = 0; i < this.children.length; i++) {
              this.children[i].applyTo(cube);
            }
          }
        }
        class CommutationNode extends Node {
          constructor(layerCount, startPosition, endPosition) {
            super(layerCount, startPosition, endPosition);
            this.commutator = null;
          }

          setCommutator(newValue) {
            this.commutator = newValue;
          }
        }
        class ConjugationNode extends Node {
          constructor(layerCount, startPosition, endPosition) {
            super(layerCount, startPosition, endPosition);
            this.conjugator = null;
          }

          setConjugator(newValue) {
            this.conjugator = newValue;
          }
        }
        class SequenceNode extends Node {
          constructor(layerCount, startPosition, endPosition) {
            super(layerCount, startPosition, endPosition);
          }
        }
        class StatementNode extends Node {
          constructor(layerCount, startPosition, endPosition) {
            super(layerCount, startPosition, endPosition);
          }
        }
        class GroupingNode extends Node {
          constructor(layerCount, startPosition, endPosition) {
            super(layerCount, startPosition, endPosition);
            this.layerCount = layerCount;
          }
        }
        class InversionNode extends Node {
          constructor(layerCount, startPosition, endPosition) {
            super(layerCount, startPosition, endPosition);
          }
        }
        class PermutationItem extends Node {
          constructor(layerCount, startPosition, endPosition) {
            super(layerCount, startPosition, endPosition);
          }
        }
        const PLUS_SIGN = 3;
        const PLUSPLUS_SIGN = 2;
        const MINUS_SIGN = 1;
        const NO_SIGN = 0;
        const UNDEFINED_SIGN = null;
        const SIDE_PERMUTATION = 1;
        const EDGE_PERMUTATION = 2;
        const CORNER_PERMUTATION = 3;
        const UNDEFINED_PERMUTATION = null;
        class PermutationNode extends Node {
          constructor(layerCount, startPosition, endPosition) {
            super(layerCount, startPosition, endPosition);
            this.type = UNDEFINED_PERMUTATION;
            this.sign = UNDEFINED_SIGN;
          }

          addPermItem(type, signSymbol, faceSymbols, partNumber = 0, layerCount = 3) {
            if (this.type == null) {
              this.type = type;
            }
            if (this.type != type) {
              throw new IllegalArgumentException('Permutation of different part types is not supported. Current type:' + this.type + ' Added type:' + type + ' Current length:' + this.getChildCount());
            }
            let s = null;
            if (signSymbol == Symbol.PERMUTATION_MINUS) {
              s = MINUS_SIGN;
            } else if (signSymbol == Symbol.PERMUTATION_PLUSPLUS) {
              s = PLUSPLUS_SIGN;
            } else if (signSymbol == Symbol.PERMUTATION_PLUS) {
              s = PLUS_SIGN;
            } else if (signSymbol == null) {
              s = NO_SIGN;
            } else {
              throw new IllegalArgumentException('Illegal sign symbol:' + signSymbol);
            }
            if (s == PLUS_SIGN) {
              if (type == CORNER_PERMUTATION) {
                s = PLUSPLUS_SIGN;
              } else if (type == EDGE_PERMUTATION) {
                s = MINUS_SIGN;
              }
            }
            if (this.getChildCount() == 0) {
              this.sign = s;
            } else if (type != SIDE_PERMUTATION && s != NO_SIGN) {
              throw new IllegalArgumentException('Illegal sign.');
            }
            const permItem = new PermutationItem();
            let loc = -1;
            switch (type) {
              case UNDEFINED_PERMUTATION:
                break;
              case SIDE_PERMUTATION: {
                if (faceSymbols[0] == Symbol.FACE_R) {
                  loc = 0;
                } else if (faceSymbols[0] == Symbol.FACE_U) {
                  loc = 1;
                } else if (faceSymbols[0] == Symbol.FACE_F) {
                  loc = 2;
                } else if (faceSymbols[0] == Symbol.FACE_L) {
                  loc = 3;
                } else if (faceSymbols[0] == Symbol.FACE_D) {
                  loc = 4;
                } else if (faceSymbols[0] == Symbol.FACE_B) {
                  loc = 5;
                }
                if (layerCount <= 3) {
                  if (partNumber != 0) {
                    throw new IllegalArgumentException('Illegal side part number ' + partNumber);
                  }
                } else {
                  if (partNumber < 0 || partNumber > (2 << (layerCount - 2)) - 1) {
                    throw new IllegalArgumentException('Illegal side part number ' + partNumber);
                  }
                }
                loc += 6 * partNumber;
                permItem.location = loc;
                permItem.orientation = (this.getChildCount() == 0) ? 0 : s;
                break;
              }
              case EDGE_PERMUTATION: {
                if (signSymbol != null && signSymbol != Symbol.PERMUTATION_PLUS) {
                  throw new IllegalArgumentException('Illegal sign for edge part. [' + signSymbol + ']');
                }
                const low = (faceSymbols[0].compareTo(faceSymbols[1]) < 0) ? faceSymbols[0] : faceSymbols[1];
                const high = (faceSymbols[0].compareTo(faceSymbols[1]) > 0) ? faceSymbols[0] : faceSymbols[1];
                const first = faceSymbols[0];
                let rotated = false;
                if (low == Symbol.FACE_R && high == Symbol.FACE_U) {
                  loc = 0;
                  rotated = first == Symbol.FACE_R;
                } else if (low == Symbol.FACE_R && high == Symbol.FACE_F) {
                  loc = 1;
                  rotated = first == Symbol.FACE_F;
                } else if (low == Symbol.FACE_R && high == Symbol.FACE_D) {
                  loc = 2;
                  rotated = first == Symbol.FACE_R;
                } else if (low == Symbol.FACE_U && high == Symbol.FACE_B) {
                  loc = 3;
                  rotated = first == Symbol.FACE_U;
                } else if (low == Symbol.FACE_R && high == Symbol.FACE_B) {
                  loc = 4;
                  rotated = first == Symbol.FACE_B;
                } else if (low == Symbol.FACE_D && high == Symbol.FACE_B) {
                  loc = 5;
                  rotated = first == Symbol.FACE_D;
                } else if (low == Symbol.FACE_U && high == Symbol.FACE_L) {
                  loc = 6;
                  rotated = first == Symbol.FACE_L;
                } else if (low == Symbol.FACE_L && high == Symbol.FACE_B) {
                  loc = 7;
                  rotated = first == Symbol.FACE_B;
                } else if (low == Symbol.FACE_L && high == Symbol.FACE_D) {
                  loc = 8;
                  rotated = first == Symbol.FACE_L;
                } else if (low == Symbol.FACE_U && high == Symbol.FACE_F) {
                  loc = 9;
                  rotated = first == Symbol.FACE_U;
                } else if (low == Symbol.FACE_F && high == Symbol.FACE_L) {
                  loc = 10;
                  rotated = first == Symbol.FACE_F;
                } else if (low == Symbol.FACE_F && high == Symbol.FACE_D) {
                  loc = 11;
                  rotated = first == Symbol.FACE_D;
                } else {
                  throw new IllegalArgumentException('Impossible edge part.');
                }
                if (layerCount <= 3) {
                  if (partNumber != 0) {
                    throw new IllegalArgumentException('Illegal edge part number ' + partNumber);
                  }
                } else {
                  if (partNumber < 0 || partNumber >= layerCount - 2) {
                    throw new IllegalArgumentException('Illegal edge part number ' + partNumber);
                  }
                  loc += 12 * partNumber;
                }
                permItem.location = loc;
                permItem.orientation = (rotated) ? 1 : 0;
                break;
              }
              case CORNER_PERMUTATION: {
                if (signSymbol == Symbol.PERMUTATION_PLUSPLUS) {
                  throw new IllegalArgumentException('Illegal sign for corner part.');
                }
                const sorted = faceSymbols.clone();
                Arrays.sort(sorted);
                const low = sorted[0];
                const mid = sorted[1];
                const high = sorted[2];
                let rotation = 0;
                if (low == Symbol.FACE_R && mid == Symbol.FACE_U && high == Symbol.FACE_F) {
                  loc = 0;
                  if (faceSymbols[0] == Symbol.FACE_U) {
                    rotation = (faceSymbols[1] == Symbol.FACE_R) ? 0 : 3;
                  } else if (faceSymbols[0] == Symbol.FACE_R) {
                    rotation = (faceSymbols[1] == Symbol.FACE_F) ? 2 : 5;
                  } else {
                    rotation = (faceSymbols[1] == Symbol.FACE_U) ? 1 : 4;
                  }
                } else if (low == Symbol.FACE_R && mid == Symbol.FACE_F && high == Symbol.FACE_D) {
                  loc = 1;
                  if (faceSymbols[0] == Symbol.FACE_D) {
                    rotation = (faceSymbols[1] == Symbol.FACE_F) ? 0 : 3;
                  } else if (faceSymbols[0] == Symbol.FACE_F) {
                    rotation = (faceSymbols[1] == Symbol.FACE_R) ? 2 : 5;
                  } else {
                    rotation = (faceSymbols[1] == Symbol.FACE_D) ? 1 : 4;
                  }
                } else if (low == Symbol.FACE_R && mid == Symbol.FACE_U && high == Symbol.FACE_B) {
                  loc = 2;
                  if (faceSymbols[0] == Symbol.FACE_U) {
                    rotation = (faceSymbols[1] == Symbol.FACE_B) ? 0 : 3;
                  } else if (faceSymbols[0] == Symbol.FACE_B) {
                    rotation = (faceSymbols[1] == Symbol.FACE_R) ? 2 : 5;
                  } else {
                    rotation = (faceSymbols[1] == Symbol.FACE_U) ? 1 : 4;
                  }
                } else if (low == Symbol.FACE_R && mid == Symbol.FACE_D && high == Symbol.FACE_B) {
                  loc = 3;
                  if (faceSymbols[0] == Symbol.FACE_D) {
                    rotation = (faceSymbols[1] == Symbol.FACE_R) ? 0 : 3;
                  } else if (faceSymbols[0] == Symbol.FACE_R) {
                    rotation = (faceSymbols[1] == Symbol.FACE_B) ? 2 : 5;
                  } else {
                    rotation = (faceSymbols[1] == Symbol.FACE_D) ? 1 : 4;
                  }
                } else if (low == Symbol.FACE_U && mid == Symbol.FACE_L && high == Symbol.FACE_B) {
                  loc = 4;
                  if (faceSymbols[0] == Symbol.FACE_U) {
                    rotation = (faceSymbols[1] == Symbol.FACE_L) ? 0 : 3;
                  } else if (faceSymbols[0] == Symbol.FACE_L) {
                    rotation = (faceSymbols[1] == Symbol.FACE_B) ? 2 : 5;
                  } else {
                    rotation = (faceSymbols[1] == Symbol.FACE_U) ? 1 : 4;
                  }
                } else if (low == Symbol.FACE_L && mid == Symbol.FACE_D && high == Symbol.FACE_B) {
                  loc = 5;
                  if (faceSymbols[0] == Symbol.FACE_D) {
                    rotation = (faceSymbols[1] == Symbol.FACE_B) ? 0 : 3;
                  } else if (faceSymbols[0] == Symbol.FACE_B) {
                    rotation = (faceSymbols[1] == Symbol.FACE_L) ? 2 : 5;
                  } else {
                    rotation = (faceSymbols[1] == Symbol.FACE_D) ? 1 : 4;
                  }
                } else if (low == Symbol.FACE_U && mid == Symbol.FACE_F && high == Symbol.FACE_L) {
                  loc = 6;
                  if (faceSymbols[0] == Symbol.FACE_U) {
                    rotation = (faceSymbols[1] == Symbol.FACE_F) ? 0 : 3;
                  } else if (faceSymbols[0] == Symbol.FACE_F) {
                    rotation = (faceSymbols[1] == Symbol.FACE_L) ? 2 : 5;
                  } else {
                    rotation = (faceSymbols[1] == Symbol.FACE_U) ? 1 : 4;
                  }
                } else if (low == Symbol.FACE_F && mid == Symbol.FACE_L && high == Symbol.FACE_D) {
                  loc = 7;
                  if (faceSymbols[0] == Symbol.FACE_D) {
                    rotation = (faceSymbols[1] == Symbol.FACE_L) ? 0 : 3;
                  } else if (faceSymbols[0] == Symbol.FACE_L) {
                    rotation = (faceSymbols[1] == Symbol.FACE_F) ? 2 : 5;
                  } else {
                    rotation = (faceSymbols[1] == Symbol.FACE_D) ? 1 : 4;
                  }
                } else {
                  throw new IllegalArgumentException('Impossible corner part.');
                }
                permItem.location = loc;
                permItem.orientation = rotation;
                for (let i = 0; i < this.getChildCount(); i++) {
                  const existingItem = this.getChildAt(i);
                  if (existingItem.orientation / 3 != permItem.orientation / 3) {
                    throw new IllegalArgumentException('Corner permutation cannot be clockwise and anticlockwise at the same time.');
                  }
                }
                break;
              }
            }
            for (let i = 0; i < this.getChildCount(); i++) {
              const existingItem = this.getChildAt(i);
              if (existingItem.location == permItem.location) {
                throw new IllegalArgumentException('Illegal multiple occurrence of same part. ' + permItem.location);
              }
            }
            this.add(permItem);
          }
        }
        class ReflectionNode extends Node {
          constructor(layerCount, startPosition, endPosition) {
            super(layerCount, startPosition, endPosition);
          }
        }
        class RepetitionNode extends Node {
          constructor(layerCount, startPosition, endPosition, repeatCount) {
            super(layerCount, startPosition, endPosition);
            this.repeatCount = repeatCount;
          }

          setRepeatCount(newValue) {
            this.repeatCount = newValue;
          }
        }
        class NOPNode extends Node {
          constructor(layerCount, startPosition, endPosition) {
            super(layerCount, startPosition, endPosition);
          }
        }
        class MoveNode extends Node {
          constructor(layerCount, axis, layerMask, angle) {
            super(layerCount, -1, -1);
            this.axis = axis;
            this.angle = angle;
            this.layerMask = layerMask;
          }

          setAxis(newValue) {
            this.axis = newValue;
          }

          setAngle(newValue) {
            this.angle = newValue;
          }

          setLayerCount(newValue) {
            this.layerCount = newValue;
          }

          setLayerMask(newValue) {
            this.layerMask = newValue;
          }

          applyTo(cube) {
            if (!this.doesNothing()) {
              cube.transform(this.axis, this.layerMask, this.angle);
            }
          }

          applyInverseTo(cube) {
            if (!this.doesNothing()) {
              cube.transform(this.axis, this.layerMask, -this.angle);
            }
          }

          doesNothing() {
            return this.angle == 0 || this.layerMask == 0;
          }

          consume(that) {
            if (that.axis == this.axis &&
            that.layerMask == this.layerMask) {
              this.angle = (this.angle + that.angle) % 4;
              if (this.angle == 3) { this.angle = -1; } else if (this.angle == -3) { this.angle = 1; }
              return true;
            }
            return false;
          }

          toString() {
            return 'MoveNode{ax:' + this.axis + ' an:' + this.angle + ' lm:' + this.layerMask + '}';
          }
        }
        return {
          CommutationNode: CommutationNode,
          ConjugationNode: ConjugationNode,
          GroupingNode: GroupingNode,
          InversionNode: InversionNode,
          Node: Node,
          MoveNode: MoveNode,
          NOPNode: NOPNode,
          ReflectionNode: ReflectionNode,
          RepetitionNode: RepetitionNode,
          SequenceNode: SequenceNode,
          StatementNode: StatementNode,
          PermutationNode: PermutationNode
        };
      });
    'use strict';
    define('ScriptNotation', [],
      function () {
        const Syntax = {
          PREFIX: 'prefix',
          SUFFIX: 'suffix',
          CIRCUMFIX: 'circumfix',
          PRECIRCUMFIX: 'precircumfix',
          POSTCIRCUMFIX: 'postcircumfix',
          PREINFIX: 'preinfix',
          POSTINFIX: 'postinfix'
        };
        class Symbol {
          constructor(name) {
            this.name = name;
          }

          getType() {
            return this;
          }

          getSubSymbols() {
            return [];
          }

          isTerminalSymbol() {
            return true;
          }

          isSubSymbol(s) {
            return false;
          }

          toString() {
            return this.name;
          }

          getName() {
            return this.name;
          }
        }
        class TerminalSymbol extends Symbol {
          constructor(name, alternativeName) {
            super(name);
            this.alternativeName = alternativeName;
          }

          getAlternativeName() {
            return this.alternativeName;
          }
        }
        class CompoundSymbol extends Symbol {
          constructor(name, subSymbols) {
            super(name);
            this.subSymbols = subSymbols;
          }

          getSubSymbols() {
            return this.subSymbols;
          }

          isTerminalSymbol() {
            return false;
          }

          isSubSymbol(s) {
            if (this.subSymbols != null) {
              for (let i = 0; i < this.subSymbols.length; i++) {
                if (s == this.subSymbols[i]) { return true; }
              }
              return false;
            } else {
              return s == this;
            }
          }
        }
        class FaceSymbol extends Symbol {
          constructor(name, face) {
            super();
            this.face = face;
          }

          getFace() {
            return this.face;
          }

          toString() {
            return 'Face face=' + this.face;
          }

          getType() {
            return Symbol.FACE;
          }
        }
        Symbol.NOP = new TerminalSymbol('NOP');
        Symbol.MOVE = new TerminalSymbol('move', 'twist');
        Symbol.FACE_R = new FaceSymbol('r', 0);
        Symbol.FACE_U = new FaceSymbol('u', 1);
        Symbol.FACE_F = new FaceSymbol('f', 2);
        Symbol.FACE_L = new FaceSymbol('l', 3);
        Symbol.FACE_D = new FaceSymbol('d', 4);
        Symbol.FACE_B = new FaceSymbol('b', 5);
        Symbol.PERMUTATION_PLUS = new TerminalSymbol('permPlus');
        Symbol.PERMUTATION_MINUS = new TerminalSymbol('permMinus');
        Symbol.PERMUTATION_PLUSPLUS = new TerminalSymbol('permPlusPlus');
        Symbol.PERMUTATION_BEGIN = new TerminalSymbol('permBegin', 'permutationBegin');
        Symbol.PERMUTATION_END = new TerminalSymbol('permEnd', 'permutationEnd');
        Symbol.PERMUTATION_DELIMITER = new TerminalSymbol('permDelim', 'permutationDelimiter');
        Symbol.DELIMITER = new TerminalSymbol('delimiter', 'statementDelimiter');
        Symbol.INVERSION_BEGIN = new TerminalSymbol('inversionBegin');
        Symbol.INVERSION_END = new TerminalSymbol('inversionEnd');
        Symbol.INVERSION_DELIMITER = new TerminalSymbol('inversionDelim');
        Symbol.INVERTOR = new TerminalSymbol('invertor');
        Symbol.REFLECTION_BEGIN = new TerminalSymbol('reflectionBegin');
        Symbol.REFLECTION_END = new TerminalSymbol('reflectionEnd');
        Symbol.REFLECTION_DELIMITER = new TerminalSymbol('reflectionDelim');
        Symbol.REFLECTOR = new TerminalSymbol('reflector');
        Symbol.GROUPING_BEGIN = new TerminalSymbol('groupingBegin', 'sequenceBegin');
        Symbol.GROUPING_END = new TerminalSymbol('groupingEnd', 'sequenceEnd');
        Symbol.REPETITION_BEGIN = new TerminalSymbol('repetitionBegin', 'repetitorBegin');
        Symbol.REPETITION_END = new TerminalSymbol('repetitionEnd', 'repetitorEnd');
        Symbol.REPETITION_DELIMITER = new TerminalSymbol('repetitionDelim', 'repetitorDelimiter');
        Symbol.COMMUTATION_BEGIN = new TerminalSymbol('commutationBegin', 'commutatorBegin');
        Symbol.COMMUTATION_END = new TerminalSymbol('commutationEnd', 'commutatorEnd');
        Symbol.COMMUTATION_DELIMITER = new TerminalSymbol('commutationDelim', 'commutatorDelimiter');
        Symbol.CONJUGATION_BEGIN = new TerminalSymbol('conjugationBegin', 'conjugatorBegin');
        Symbol.CONJUGATION_END = new TerminalSymbol('conjugationEnd', 'conjugatorEnd');
        Symbol.CONJUGATION_DELIMITER = new TerminalSymbol('conjugationDelim', 'conjugatorDelimiter');
        Symbol.ROTATION_BEGIN = new TerminalSymbol('rotationBegin', 'rotatorBegin');
        Symbol.ROTATION_END = new TerminalSymbol('rotationEnd', 'rotatorEnd');
        Symbol.ROTATION_DELIMITER = new TerminalSymbol('rotationDelim', 'rotatorDelimiter');
        Symbol.MACRO = new TerminalSymbol('macro');
        Symbol.MULTILINE_COMMENT_BEGIN = new TerminalSymbol('commentMultiLineBegin', 'slashStarCommentBegin');
        Symbol.MULTILINE_COMMENT_END = new TerminalSymbol('commentMultiLineEnd', 'slashStarCommentEnd');
        Symbol.SINGLELINE_COMMENT_BEGIN = new TerminalSymbol('commentSingleLineBegin', 'slashSlashComment');
        Symbol.COMMUTATION = new CompoundSymbol('commutation', [
          Symbol.COMMUTATION_BEGIN,
          Symbol.COMMUTATION_END,
          Symbol.COMMUTATION_DELIMITER
        ]);
        Symbol.CONJUGATION = new CompoundSymbol('conjugation', [
          Symbol.CONJUGATION_BEGIN,
          Symbol.CONJUGATION_END,
          Symbol.CONJUGATION_DELIMITER
        ]);
        Symbol.GROUPING = new CompoundSymbol('grouping', [
          Symbol.GROUPING_BEGIN,
          Symbol.GROUPING_END
        ]);
        Symbol.INVERSION = new CompoundSymbol('inversion', [
          Symbol.INVERSION_BEGIN,
          Symbol.INVERSION_END,
          Symbol.INVERSION_DELIMITER,
          Symbol.INVERTOR
        ]);
        Symbol.PERMUTATION = new CompoundSymbol('permutation', [
          Symbol.FACE_R,
          Symbol.FACE_U,
          Symbol.FACE_F,
          Symbol.FACE_L,
          Symbol.FACE_D,
          Symbol.FACE_B,
          Symbol.PERMUTATION_PLUS,
          Symbol.PERMUTATION_MINUS,
          Symbol.PERMUTATION_PLUSPLUS,
          Symbol.PERMUTATION_BEGIN,
          Symbol.PERMUTATION_END,
          Symbol.PERMUTATION_DELIMITER
        ]);
        Symbol.FACE = new CompoundSymbol('face', [
          Symbol.FACE_R,
          Symbol.FACE_U,
          Symbol.FACE_F,
          Symbol.FACE_L,
          Symbol.FACE_D,
          Symbol.FACE_B
        ]);
        Symbol.REFLECTION = new CompoundSymbol('reflection', [
          Symbol.REFLECTION_BEGIN,
          Symbol.REFLECTION_END,
          Symbol.REFLECTION_DELIMITER,
          Symbol.REFLECTOR
        ]);
        Symbol.REPETITION = new CompoundSymbol('repetition', [
          Symbol.REPETITION_BEGIN,
          Symbol.REPETITION_END,
          Symbol.REPETITION_DELIMITER
        ]);
        Symbol.ROTATION = new CompoundSymbol('rotation', [
          Symbol.ROTATION_BEGIN,
          Symbol.ROTATION_END,
          Symbol.ROTATION_DELIMITER
        ]);
        Symbol.COMMENT = new CompoundSymbol('comment', [
          Symbol.MULTILINE_COMMENT_BEGIN,
          Symbol.MULTILINE_COMMENT_END,
          Symbol.SINGLELINE_COMMENT_BEGIN
        ]);
        Symbol.STATEMENT = new CompoundSymbol('statement', [
          Symbol.NOP,
          Symbol.MOVE,
          Symbol.GROUPING,
          Symbol.INVERSION,
          Symbol.REFLECTION,
          Symbol.CONJUGATION,
          Symbol.COMMUTATION,
          Symbol.ROTATION,
          Symbol.PERMUTATION,
          Symbol.DELIMITER,
          Symbol.REPETITION
        ]);
        Symbol.SEQUENCE = new CompoundSymbol('sequence', [
          Symbol.STATEMENT,
          Symbol.COMMENT
        ]);
        class MoveSymbol extends Symbol {
          constructor(axis, layerMask, angle) {
            super();
            this.axis = axis;
            this.layerMask = layerMask;
            this.angle = angle;
          }

          toInverse() {
            return new MoveSymbol(this.axis, this.layerMask, -this.angle);
          }

          getAxis() {
            return this.axis;
          }

          getAngle() {
            return this.angle;
          }

          getLayerMask() {
            return this.layerMask;
          }

          getLayerList() {
            let buf = '';
            for (let i = 0; i < 8; i++) {
              if ((this.layerMask & (1 << i)) != 0) {
                if (buf.length() > 0) {
                  buf += ',';
                }
                buf += (i + 1);
              }
            }
            return buf;
          }

          toString() {
            return 'Move axis=' + this.axis + ' mask=' + this.layerMask + ' angle=' + this.angle;
          }

          getType() {
            return Symbol.MOVE;
          }
        }
        Symbol.R = new MoveSymbol(0, 4, 1);
        Symbol.L = new MoveSymbol(0, 1, -1);
        Symbol.U = new MoveSymbol(1, 4, 1);
        Symbol.D = new MoveSymbol(1, 1, -1);
        Symbol.F = new MoveSymbol(2, 4, 1);
        Symbol.B = new MoveSymbol(2, 1, -1);
        Symbol.RI = new MoveSymbol(0, 4, -1);
        Symbol.LI = new MoveSymbol(0, 1, 1);
        Symbol.UI = new MoveSymbol(1, 4, -1);
        Symbol.DI = new MoveSymbol(1, 1, 1);
        Symbol.FI = new MoveSymbol(2, 4, -1);
        Symbol.BI = new MoveSymbol(2, 1, 1);
        Symbol.R2 = new MoveSymbol(0, 4, 2);
        Symbol.L2 = new MoveSymbol(0, 1, 2);
        Symbol.U2 = new MoveSymbol(1, 4, 2);
        Symbol.D2 = new MoveSymbol(1, 1, 2);
        Symbol.F2 = new MoveSymbol(2, 4, 2);
        Symbol.B2 = new MoveSymbol(2, 1, 2);
        Symbol.CR = new MoveSymbol(0, 7, 1);
        Symbol.CL = new MoveSymbol(0, 7, -1);
        Symbol.CU = new MoveSymbol(1, 7, 1);
        Symbol.CD = new MoveSymbol(1, 7, -1);
        Symbol.CF = new MoveSymbol(2, 7, 1);
        Symbol.CB = new MoveSymbol(2, 7, -1);
        Symbol.CR2 = new MoveSymbol(0, 7, 2);
        Symbol.CL2 = new MoveSymbol(0, 7, 2);
        Symbol.CU2 = new MoveSymbol(1, 7, 2);
        Symbol.CD2 = new MoveSymbol(1, 7, 2);
        Symbol.CF2 = new MoveSymbol(2, 7, 2);
        Symbol.CB2 = new MoveSymbol(2, 7, 2);
        class Notation {
          constructor() {
            this.macros = [];
            this.keywords = [];
            this.specials = [];
            this.layerCount = 3;
            this.symbolToTokenMap = {};
            this.tokenToSymbolMap = {};
            this.moveToTokenMap = {};
            this.tokenToMoveMap = {};
            this.symbolToSyntaxMap = {};
          }

          getMacros() {
            return this.macros;
          }

          getKeywords() {
            return this.keywords;
          }

          getSpecials() {
            return this.specials;
          }

          getLayerCount() {
            return this.layerCount;
          }

          addToken(symbol, token) {
            if (this.symbolToTokenMap[symbol] == null) {
              this.symbolToTokenMap[symbol] = token;
            }
            let symbols = this.tokenToSymbolMap[token];
            if (symbols == null) {
              symbols = [];
              this.tokenToSymbolMap[token] = symbols;
            }
            symbols.push(symbol);
          }

          getTokenToSymbolMap() {
            return this.tokenToSymbolMap;
          }

          isSyntax(symbol, syntax) {
            if (symbol == null || syntax == null) {
              throw new Error('illegal arguments symbol:' + symbol + ' syntax:' + syntax);
            }
            return this.symbolToSyntaxMap[symbol] == syntax;
          }

          getSyntax(symbol) {
            return this.symbolToSyntaxMap[symbol];
          }

          isSupported(symbol) {
            return this.symbolToSyntaxMap[symbol] != null || this.symbolToTokenMap[symbol] != null;
          }
        }
        class DefaultNotation extends Notation {
          constructor(layerCount) {
            super();
            this.layerCount = layerCount == null ? 3 : layerCount;
            this.addToken(Symbol.NOP, '·');
            this.addToken(Symbol.NOP, '.');
            this.addToken(Symbol.FACE_R, 'r');
            this.addToken(Symbol.FACE_U, 'u');
            this.addToken(Symbol.FACE_F, 'f');
            this.addToken(Symbol.FACE_L, 'l');
            this.addToken(Symbol.FACE_D, 'd');
            this.addToken(Symbol.FACE_B, 'b');
            this.addToken(Symbol.PERMUTATION_PLUS, '+');
            this.addToken(Symbol.PERMUTATION_MINUS, '-');
            this.addToken(Symbol.PERMUTATION_PLUSPLUS, '++');
            this.addToken(Symbol.PERMUTATION_BEGIN, '(');
            this.addToken(Symbol.PERMUTATION_END, ')');
            this.addToken(Symbol.PERMUTATION_DELIMITER, ',');
            this.addToken(Symbol.INVERTOR, "'");
            this.addToken(Symbol.INVERTOR, '-');
            this.addToken(Symbol.REFLECTOR, '*');
            this.addToken(Symbol.GROUPING_BEGIN, '(');
            this.addToken(Symbol.GROUPING_END, ')');
            this.addToken(Symbol.COMMUTATION_BEGIN, '[');
            this.addToken(Symbol.COMMUTATION_END, ']');
            this.addToken(Symbol.COMMUTATION_DELIMITER, ',');
            this.addToken(Symbol.CONJUGATION_BEGIN, '<');
            this.addToken(Symbol.CONJUGATION_END, '>');
            this.addToken(Symbol.ROTATION_BEGIN, '<');
            this.addToken(Symbol.ROTATION_END, ">'");
            this.addToken(Symbol.MULTILINE_COMMENT_BEGIN, '/*');
            this.addToken(Symbol.MULTILINE_COMMENT_END, '*/');
            this.addToken(Symbol.SINGLELINE_COMMENT_BEGIN, '//');
            const inner = 1;
            const middle = 1 << (this.layerCount / 2);
            const outer = 1 << (this.layerCount - 1);
            const all = inner | middle | outer;
            this.addToken(new MoveSymbol(0, outer, 1), 'R');
            this.addToken(new MoveSymbol(1, outer, 1), 'U');
            this.addToken(new MoveSymbol(2, outer, 1), 'F');
            this.addToken(new MoveSymbol(0, inner, -1), 'L');
            this.addToken(new MoveSymbol(1, inner, -1), 'D');
            this.addToken(new MoveSymbol(2, inner, -1), 'B');
            this.addToken(new MoveSymbol(0, outer | inner, 1), 'SR');
            this.addToken(new MoveSymbol(1, outer | inner, 1), 'SU');
            this.addToken(new MoveSymbol(2, outer | inner, 1), 'SF');
            this.addToken(new MoveSymbol(0, outer | inner, -1), 'SL');
            this.addToken(new MoveSymbol(1, outer | inner, -1), 'SD');
            this.addToken(new MoveSymbol(2, outer | inner, -1), 'SB');
            this.addToken(new MoveSymbol(0, middle | outer, 1), 'TR');
            this.addToken(new MoveSymbol(1, middle | outer, 1), 'TU');
            this.addToken(new MoveSymbol(2, middle | outer, 1), 'TF');
            this.addToken(new MoveSymbol(0, middle | inner, -1), 'TL');
            this.addToken(new MoveSymbol(1, middle | inner, -1), 'TD');
            this.addToken(new MoveSymbol(2, middle | inner, -1), 'TB');
            this.addToken(new MoveSymbol(0, middle, 1), 'MR');
            this.addToken(new MoveSymbol(1, middle, 1), 'MU');
            this.addToken(new MoveSymbol(2, middle, 1), 'MF');
            this.addToken(new MoveSymbol(0, middle, -1), 'ML');
            this.addToken(new MoveSymbol(1, middle, -1), 'MD');
            this.addToken(new MoveSymbol(2, middle, -1), 'MB');
            this.addToken(new MoveSymbol(0, all, 1), 'CR');
            this.addToken(new MoveSymbol(1, all, 1), 'CU');
            this.addToken(new MoveSymbol(2, all, 1), 'CF');
            this.addToken(new MoveSymbol(0, all, -1), 'CL');
            this.addToken(new MoveSymbol(1, all, -1), 'CD');
            this.addToken(new MoveSymbol(2, all, -1), 'CB');
            this.symbolToSyntaxMap[Symbol.COMMUTATION] = Syntax.PRECIRCUMFIX;
            this.symbolToSyntaxMap[Symbol.CONJUGATION] = Syntax.PREFIX;
            this.symbolToSyntaxMap[Symbol.ROTATION] = Syntax.PREFIX;
            this.symbolToSyntaxMap[Symbol.GROUPING] = Syntax.CIRCUMFIX;
            this.symbolToSyntaxMap[Symbol.PERMUTATION] = Syntax.PRECIRCUMFIX;
            this.symbolToSyntaxMap[Symbol.REPETITION] = Syntax.SUFFIX;
            this.symbolToSyntaxMap[Symbol.REFLECTION] = Syntax.SUFFIX;
            this.symbolToSyntaxMap[Symbol.INVERSION] = Syntax.SUFFIX;
          }
        }
        return {
          Notation: Notation,
          DefaultNotation: DefaultNotation,
          Symbol: Symbol,
          Syntax: Syntax
        };
      });
    'use strict';
    define('ScriptParser', ['ScriptNotation', 'ScriptAST', 'Tokenizer'],
      function (Notation, AST, Tokenizer) {
        const module = {
          log: (false) ? console.log : () => {
          },
          info: (true) ? console.info : () => {
          },
          warning: (true) ? console.warning : () => {
          },
          error: (true) ? console.error : () => {
          }
        };
        class ParseException extends Error {
          constructor(msg, start, end) {
            super(msg);
            this.msg = msg;
            this.start = start;
            this.end = end;
          }

          toString() {
            return this.msg + ' at:' + this.start + '..' + this.end;
          }
        }
        class Node {
        }
        class TwistNode extends Node {
          constructor(axis, layerMask, angle) {
            this.axis = axis;
            this.angle = angle;
            this.layerMask = layerMask;
          }

          applyTo(cube) {
            if (!this.doesNothing()) {
              cube.transform(this.axis, this.layerMask, this.angle);
            }
          }

          applyInverseTo(cube) {
            if (!this.doesNothing()) {
              cube.transform(this.axis, this.layerMask, -this.angle);
            }
          }

          doesNothing() {
            return this.angle == 0 || this.layerMask == 0;
          }

          consume(that) {
            if (that.axis == this.axis &&
            that.layerMask == this.layerMask) {
              this.angle = (this.angle + that.angle) % 4;
              if (this.angle == 3) { this.angle = -1; } else if (this.angle == -3) { this.angle = 1; }
              return true;
            }
            return false;
          }

          toString() {
            return 'TwistNode{ax:' + this.axis + ' an:' + this.angle + ' lm:' + this.layerMask + '}';
          }
        }
        const UNKNOWN_MASK = 0;
        const GROUPING_MASK = 1;
        const CONJUGATION_MASK = 2;
        const COMMUTATION_MASK = 4;
        const ROTATION_MASK = 8;
        const PERMUTATION_MASK = 16;
        const INVERSION_MASK = 32;
        const REFLECTION_MASK = 64;
        class ScriptParser {
          constructor(notation, localMacros) {
            this.notation = notation;
            this.macros = [];
            this.tokenizer = null;
            if (localMacros != null) {
              for (const macro in localMacros) {
                macros.push(macro);
              }
            }
            for (const macro in notation.getMacros()) {
              macros.push(macro);
            }
          }

          getTokenizer() {
            if (this.tokenizer == null) {
              const tt = new Tokenizer.Tokenizer();
              tt.skipWhitespace();
              tt.addNumbers();
              const tokenToSymbolMap = this.notation.getTokenToSymbolMap();
              for (const i in tokenToSymbolMap) {
                tt.addKeyword(i, tokenToSymbolMap[i]);
              }
              this.tokenizer = tt;
            }
            return this.tokenizer;
          }

          parse(str) {
            const tt = this.getTokenizer();
            tt.setInput(str);
            const root = new AST.SequenceNode();
            let guard = str.length;
            while (tt.nextToken() != Tokenizer.TT_EOF) {
              tt.pushBack();
              this.parseExpression(tt, root);
              guard = guard - 1;
              if (guard < 0) {
                throw new Error('too many iterations! ' + tt.getTokenType() + ' pos:' + tt.pos);
              }
            }
            return root;
          }

          containsType(symbols, type) {
            for (let i = 0; i < symbols.length; i++) {
              const s = symbols[i];
              if (s.getType() == type) {
                return true;
              }
            }
            return false;
          }

          intersectsTypes(symbols, types) {
            for (let i = 0; i < symbols.length; i++) {
              const s = symbols[i];
              for (let j = 0; j < types.length; j++) {
                const type = types[j];
                if (s.getType() == type) {
                  return true;
                }
              }
            }
            return false;
          }

          getFirstIntersectingType(symbols, types) {
            for (let i = 0; i < symbols.length; i++) {
              const s = symbols[i];
              for (let j = 0; j < types.length; j++) {
                const type = types[j];
                if (s.getType() == type) {
                  return s;
                }
              }
            }
            return null;
          }

          isType(symbols, type) {
            for (let i = 0; i < symbols.length; i++) {
              const s = symbols[i];
              if (s.getType() != type) {
                return false;
              }
            }
            return symbols.length > 0;
          }

          parseStatement(t, parent) {
            const ntn = this.notation;
            const Sym = Notation.Symbol;
            const Stx = Notation.Syntax;
            if (t.nextToken() != Tokenizer.TT_KEYWORD) {
              throw new ParseException('Statement: "' + t.getStringValue() + '" is a ' + t.getTokenType() + ' but not a keyword.', t.getStartPosition(), t.getEndPosition());
            }
            const startPos = t.getStartPosition();
            let symbols = t.getSymbolValue();
            if (symbols.length == 0) {
              throw new ParseException('Statement: Unknown statement ' + t.sval, t.getStartPosition(), t.getEndPosition());
            }
            if (this.containsType(symbols, Sym.MACRO)) {
              t.pushBack();
              return this.parseMacro(t, parent);
            }
            if (this.containsType(symbols, Sym.MOVE)) {
              t.pushBack();
              return this.parseMove(t, parent);
            }
            if (this.containsType(symbols, Sym.NOP)) {
              t.pushBack();
              return this.parseNOP(t, parent);
            }
            if ((ntn.isSyntax(Sym.PERMUTATION, Notation.Syntax.PREFIX) ||
            ntn.isSyntax(Sym.PERMUTATION, Notation.Syntax.PRECIRCUMFIX)
            ) &&
            this.intersectsTypes(symbols,
              [Sym.PERMUTATION_PLUS, Sym.PERMUTATION_MINUS, Sym.PERMUTATION_PLUSPLUS])) {
              const startpos = t.getStartPosition();
              const sign = symbols;
              t.nextToken();
              symbols = t.getSymbolValue();
              if (!this.containsType(symbols, Sym.PERMUTATION_BEGIN)) {
                throw new ParseException(
                  'Permutation: Unexpected token - expected permutation begin.', t.getStartPosition(), t.getEndPosition());
              }
              const pnode = this.parsePermutation(t, parent, startpos, sign);
              return pnode;
            }
            const expressionMask =
            ((this.containsType(symbols, Sym.GROUPING_BEGIN)) ? GROUPING_MASK : UNKNOWN_MASK) |
            ((ntn.isSyntax(Sym.CONJUGATION, Stx.PRECIRCUMFIX) && this.containsType(symbol, Sym.CONJUGATION_BEGIN)) ? CONJUGATION_MASK : UNKNOWN_MASK) |
            ((ntn.isSyntax(Sym.COMMUTATION, Stx.PRECIRCUMFIX) && this.containsType(symbols, Sym.COMMUTATION_BEGIN)) ? COMMUTATION_MASK : UNKNOWN_MASK) |
            ((ntn.isSyntax(Sym.ROTATION, Stx.PRECIRCUMFIX) && this.containsType(symbols, Sym.ROTATION_BEGIN)) ? ROTATION_MASK : UNKNOWN_MASK) |
            ((ntn.isSyntax(Sym.INVERSION, Stx.CIRCUMFIX) && this.containsType(symbols, Sym.INVERSION_BEGIN)) ? INVERSION_MASK : UNKNOWN_MASK) |
            ((ntn.isSyntax(Sym.REFLECTION, Stx.CIRCUMFIX) && this.containsType(symbols, Sym.REFLECTION_BEGIN)) ? REFLECTION_MASK : UNKNOWN_MASK) |
            ((ntn.isSupported(Sym.PERMUTATION) && this.containsType(symbols, Sym.PERMUTATION_BEGIN)) ? PERMUTATION_MASK : UNKNOWN_MASK);
            if (expressionMask == PERMUTATION_MASK) {
              return this.parsePermutation(t, parent, p, null);
            }
            if ((expressionMask & PERMUTATION_MASK) == PERMUTATION_MASK) {
              const startPos = t.getStartPosition();
              if (t.nextToken() != Tokenizer.TT_KEYWORD) {
                throw new ParseException('Statement: keyword expected.', t.getStartPosition(), t.getEndPosition());
              }
              symbols = t.getSymbolValue();
              t.pushBack();
              if (symbols != null && this.intersectsTypes(symbols, Sym.PERMUTATION.getSubSymbols())) {
                return this.parsePermutation(t, parent, startPos);
              } else {
                return this.parseCompoundStatement(t, parent, startPos, expressionMask ^ PERMUTATION_MASK);
              }
            }
            if (expressionMask != UNKNOWN_MASK) {
              return this.parseCompoundStatement(t, parent, startPos, expressionMask);
            }
            throw new ParseException('Statement: illegal Statement ' + t.sval, t.getStartPosition(), t.getEndPosition());
          }

          parsePermutation(t, parent, startPos, sign) {
            const ntn = this.notation;
            const Sym = Notation.Symbol;
            const Symbol = Notation.Symbol;
            const Syntax = Notation.Syntax;
            const permutation = new AST.PermutationNode(ntn.getLayerCount(), startPos, null);
            parent.add(permutation);
            permutation.setStartPosition(startPos);
            if (ntn.isSyntax(Symbol.PERMUTATION, Syntax.PRECIRCUMFIX)) {
              sign = this.parsePermutationSign(t, parent);
            }
            ThePermutation:
            while (true) {
              switch (t.nextToken()) {
                case Tokenizer.TT_KEYWORD:
                  let symbols = t.getSymbolValue();
                  if (this.containsType(symbols, Sym.PERMUTATION_END)) {
                    permutation.setEndPosition(t.getEndPosition());
                    break ThePermutation;
                  } else {
                    t.pushBack();
                    this.parsePermutationItem(t, permutation);
                    if (t.nextToken() == Tokenizer.TT_KEYWORD) {
                      symbols = t.getSymbolValue();
                      if (this.containsType(symbols, Sym.PERMUTATION_DELIMITER)) {
                      } else if (ntn.isSyntax(Symbol.PERMUTATION, Syntax.POSTCIRCUMFIX) &&
                                      (this.containsType(symbols, Symbol.PERMUTATION_PLUS) ||
                                      this.containsType(symbols, Symbol.PERMUTATION_MINUS) ||
                                      this.containsType(symbols, Symbol.PERMUTATION_PLUSPLUS))) {
                        t.pushBack();
                        sign = this.parsePermutationSign(t, parent);
                        if (t.nextToken() != Tokenizer.TT_WORD) {
                          throw new ParseException(
                            'Permutation: End expected.', t.getStartPosition(), t.getEndPosition());
                        }
                        token = fetchGreedy(t.sval);
                        if (this.containsType(symbols, Symbol.PERMUTATION_END)) {
                          permutation.setEndPosition(t.getEndPosition());
                          break ThePermutation;
                        } else {
                          throw new ParseException(
                            'Permutation: End expected.', t.getStartPosition(), t.getEndPosition());
                        }
                      } else {
                        t.pushBack();
                      }
                    } else {
                      t.pushBack();
                    }
                  }
                  break;
                case Tokenizer.TT_EOF:
                  throw new ParseException(
                    'Permutation: End missing.', t.getStartPosition(), t.getEndPosition());
                default:
                  throw new ParseException(
                    'Permutation: Internal error. ' + t.getTokenType(), t.getStartPosition(), t.getEndPosition());
              }
            }
            if (ntn.isSyntax(Symbol.PERMUTATION, Syntax.SUFFIX)) {
              sign = this.parsePermutationSign(t, parent);
            }
            if (sign != null) {
              switch (permutation.getType()) {
                case 1:
                  break;
                case 2:
                  if (sign == Symbol.PERMUTATION_PLUSPLUS ||
                              sign == Symbol.PERMUTATION_MINUS) {
                    throw new ParseException(
                      'Permutation: Illegal sign.', t.getStartPosition(), t.getEndPosition());
                  }
                  break;
                case 3:
                  if (sign == Symbol.PERMUTATION_PLUSPLUS) {
                    throw new ParseException(
                      'Permutation: Illegal sign.', t.getStartPosition(), t.getEndPosition());
                  }
                  break;
              }
              permutation.setPermutationSign(sign);
              permutation.setEndPosition(t.getEndPosition());
            }
            return permutation;
          }

          parsePermutationSign(t, parent) {
            const ntn = this.notation;
            const Sym = Notation.Symbol;
            const Syntax = Notation.Syntax;
            let sign = null;
            if (t.nextToken() != Tokenizer.TT_KEYWORD) {
              t.pushBack();
              sign = null;
            } else {
              const symbols = t.getSymbolValue();
              if (this.containsType(symbols, Sym.PERMUTATION_PLUS) ||
                      this.containsType(symbols, Sym.PERMUTATION_PLUSPLUS) ||
                      this.containsType(symbols, Sym.PERMUTATION_MINUS)) {
                sign = symbols;
              } else {
                sign = null;
                t.pushBack();
              }
            }
            return sign;
          }

          parsePermutationItem(t, parent) {
            const ntn = this.notation;
            const Sym = Notation.Symbol;
            const Symbol = Notation.Symbol;
            const Syntax = Notation.Syntax;
            const startpos = t.getStartPosition();
            let sign = null;
            let leadingSignStartPos = -1; let leadingSignEndPos = -1;
            let partName = '';
            const syntax = ntn.getSyntax(Symbol.PERMUTATION);
            if (syntax == Syntax.PRECIRCUMFIX ||
                  syntax == Syntax.PREFIX ||
                  syntax == Syntax.POSTCIRCUMFIX) {
              leadingSignStartPos = t.getStartPosition();
              leadingSignEndPos = t.getEndPosition();
              sign = this.parsePermutationSign(t, parent);
            }
            const faceSymbols = new Array(3);
            let type = 0;
            while (type < 3) {
              if (t.nextToken() != Tokenizer.TT_KEYWORD) {
                throw new ParseException('PermutationItem: Face token missing.', t.getStartPosition(), t.getEndPosition());
              }
              const symbols = t.getSymbolValue();
              if (!this.containsType(symbols, Symbol.PERMUTATION)) {
                t.pushBack();
                break;
              }
              const symbol = this.getFirstIntersectingType(symbols, Symbol.PERMUTATION_FACE.getSubSymbols());
              if (symbol != null) {
                module.log('permutationItem Face:' + t.getStringValue());
                partName = partName + t.getStringValue();
                faceSymbols[type++] = symbol;
                t.consumeGreedy(token);
              } else {
                t.pushBack();
                break;
              }
            }
            if (ntn.getLayerCount() < 3 && type < 3) {
              throw new ParseException('PermutationItem: The 2x2 cube does not have a "' + partName.toString() + '" part.', startpos, t.getEndPosition());
            }
            if (type != 1 && sign != null && (syntax == Syntax.SUFFIX)) {
              throw new ParseException('PermutationItem: Unexpected sign', leadingSignStartPos, leadingSignEndPos);
            }
            let partNumber = 0;
            if (t.nextToken() == Tokenizer.TT_WORD &&
                  (token = fetchGreedyNumber(t.sval)) != null) {
              if (type == 3) {
                throw new ParseException('PermutationItem: Corner parts must not have a number ' + partNumber, t.getStartPosition(), t.getEndPosition());
              }
              try {
                partNumber = Integer.parseInt(token);
              } catch (e) {
                throw new ParseException('PermutationItem: Internal Error ' + e.getMessage(), t.getStartPosition(), t.getEndPosition());
              }
              t.consumeGreedy(token);
            } else {
              t.pushBack();
            }
            switch (type) {
              case 3:
                if (partNumber != 0) {
                  throw new ParseException('PermutationItem: Invalid corner part number: ' + partNumber, t.getStartPosition(), t.getEndPosition());
                }
                break;
              case 2:
                switch (ntn.getLayerCount()) {
                  case 4:
                    if (partNumber < 1 || partNumber > 2) {
                      throw new ParseException('PermutationItem: Invalid edge part number for 4x4 cube: ' + partNumber, t.getStartPosition(), t.getEndPosition());
                    }
                    partNumber -= 1;
                    break;
                  case 5:
                    if (partNumber < 0 || partNumber > 2) {
                      throw new ParseException('PermutationItem: Invalid edge part number for 5x5 cube: ' + partNumber, t.getStartPosition(), t.getEndPosition());
                    }
                    break;
                  case 6:
                    if (partNumber < 1 || partNumber > 4) {
                      throw new ParseException('PermutationItem: Invalid edge part number for 6x6 cube: ' + partNumber, t.getStartPosition(), t.getEndPosition());
                    }
                    partNumber -= 1;
                    break;
                  case 7:
                    if (partNumber < 0 || partNumber > 4) {
                      throw new ParseException('PermutationItem: Invalid edge part number for 7x7 cube: ' + partNumber, t.getStartPosition(), t.getEndPosition());
                    }
                    break;
                  default:
                    if (partNumber != 0) {
                      throw new ParseException('PermutationItem: Invalid edge part number for 3x3 cube: ' + partNumber, t.getStartPosition(), t.getEndPosition());
                    }
                    break;
                }
                break;
              case 1:
                switch (ntn.getLayerCount()) {
                  case 4:
                    if (partNumber < 1 || partNumber > 4) {
                      throw new ParseException('PermutationItem: Invalid side part number for 4x4 cube: ' + partNumber, t.getStartPosition(), t.getEndPosition());
                    }
                    partNumber -= 1;
                    break;
                  case 5:
                    if (partNumber < 0 || partNumber > 8) {
                      throw new ParseException('PermutationItem: Invalid side part number for 5x5 cube: ' + partNumber, t.getStartPosition(), t.getEndPosition());
                    }
                    break;
                  case 6:
                    if (partNumber < 1 || partNumber > 16) {
                      throw new ParseException('PermutationItem: Invalid side part number for 6x6 cube: ' + partNumber, t.getStartPosition(), t.getEndPosition());
                    }
                    partNumber -= 1;
                    break;
                  case 7:
                    if (partNumber < 0 || partNumber > 24) {
                      throw new ParseException('PermutationItem: Invalid side part number for 7x7 cube: ' + partNumber, t.getStartPosition(), t.getEndPosition());
                    }
                    break;
                  default:
                    if (partNumber != 0) {
                      throw new ParseException('PermutationItem: Invalid side part number for 3x3 cube: ' + partNumber, t.getStartPosition(), t.getEndPosition());
                    }
                    break;
                }
                break;
            }
            if (syntax == Syntax.SUFFIX && type == PermutationNode.SIDE_PERMUTATION) {
              sign = parsePermutationSign(t, parent);
            }
            try {
              parent.addPermItem(type, sign, faceSymbols, partNumber, ntn.getLayerCount());
            } catch (e) {
              const pe = new ParseException(e, startpos, t.getEndPosition());
              throw pe;
            }
          }

          parseCompoundStatement(t, parent, startPos, beginTypeMask) {
            if (beginTypeMask == null) { throw new Error(new Error('illegal argument: beginTypeMask:' + beginTypeMask)); }
            const ntn = this.notation;
            const Sym = Notation.Symbol;
            const Stx = Notation.Syntax;
            const seq1 = new AST.SequenceNode();
            seq1.setStartPosition(startPos);
            parent.add(seq1);
            let seq2 = null;
            let grouping = seq1;
            let finalTypeMask = beginTypeMask & (GROUPING_MASK | CONJUGATION_MASK | COMMUTATION_MASK | ROTATION_MASK | REFLECTION_MASK | INVERSION_MASK);
            let guard = t.getInputLength();
            TheGrouping:
            while (true) {
              guard = guard - 1;
              if (guard < 0) {
                throw new Error('too many iterations');
              }
              switch (t.nextToken()) {
                case Tokenizer.TT_KEYWORD:
                  const symbols = t.getSymbolValue();
                  const endTypeMask =
                  ((this.containsType(symbols, Sym.GROUPING_END)) ? GROUPING_MASK : UNKNOWN_MASK) |
                  ((ntn.isSyntax(Sym.CONJUGATION, Stx.PRECIRCUMFIX) && this.containsType(symbols, Sym.CONJUGATION_END)) ? CONJUGATION_MASK : UNKNOWN_MASK) |
                  ((ntn.isSyntax(Sym.COMMUTATION, Stx.PRECIRCUMFIX) && this.containsType(symbols, Sym.COMMUTATION_END)) ? COMMUTATION_MASK : UNKNOWN_MASK) |
                  ((ntn.isSyntax(Sym.INVERSION, Stx.CIRCUMFIX) && this.containsType(symbols, Sym.INVERSION_END)) ? INVERSION_MASK : UNKNOWN_MASK) |
                  ((ntn.isSyntax(Sym.REFLECTION, Stx.CIRCUMFIX) && this.containsType(symbols, Sym.REFLECTION_END)) ? REFLECTION_MASK : UNKNOWN_MASK) |
                  ((ntn.isSyntax(Sym.ROTATION, Stx.PRECIRCUMFIX) && this.containsType(symbols, Sym.ROTATION_END)) ? ROTATION_MASK : UNKNOWN_MASK);
                  const delimiterTypeMask =
                  ((ntn.isSyntax(Sym.CONJUGATION, Stx.PRECIRCUMFIX) && this.containsType(symbols, Sym.CONJUGATION_DELIMITER)) ? CONJUGATION_MASK : 0) |
                  ((ntn.isSyntax(Sym.COMMUTATION, Stx.PRECIRCUMFIX) && this.containsType(symbols, Sym.COMMUTATION_DELIMITER)) ? COMMUTATION_MASK : 0) |
                  ((ntn.isSyntax(Sym.ROTATION, Stx.PRECIRCUMFIX) && this.containsType(symbols, Sym.ROTATION_DELIMITER)) ? ROTATION_MASK : 0);
                  if (endTypeMask != 0) {
                    finalTypeMask &= endTypeMask;
                    grouping.setEndPosition(t.getEndPosition());
                    break TheGrouping;
                  } else if (delimiterTypeMask != 0) {
                    finalTypeMask &= delimiterTypeMask;
                    if (finalTypeMask == 0) {
                      throw new ParseException('Grouping: illegal delimiter:' + t.getStringValue(), t.getStartPosition(), t.getEndPosition());
                    }
                    if (seq2 == null) {
                      seq1.setEndPosition(t.getStartPosition());
                      seq2 = new AST.SequenceNode(ntn.getLayerCount());
                      seq2.setStartPosition(t.getEndPosition());
                      parent.add(seq2);
                      grouping = seq2;
                    } else {
                      throw new ParseException('Grouping: Delimiter must occur only once', t.getStartPosition(), t.getEndPosition());
                    }
                  } else {
                    t.pushBack();
                    this.parseExpression(t, grouping);
                  }
                  break;
                case Tokenizer.TT_EOF:
                  throw new ParseException('Grouping: End missing.', t.getStartPosition(), t.getEndPosition());
                default:
                  throw new ParseException('Grouping: Internal error.', t.getStartPosition(), t.getEndPosition());
              }
            }
            seq1.removeFromParent();
            if (seq2 == null) {
              finalTypeMask &= GROUPING_MASK;
            } else {
              seq2.removeFromParent();
              finalTypeMask &= -1 ^ GROUPING_MASK;
            }
            switch (finalTypeMask) {
              case GROUPING_MASK:
                if (seq2 != null) {
                  throw new ParseException('Grouping: illegal Grouping.', startPos, t.getEndPosition());
                } else {
                  grouping = new AST.GroupingNode(ntn.getLayerCount(), startPos, t.getEndPosition());
                  for (let i = seq1.getChildCount() - 1; i >= 0; i--) {
                    grouping.add(seq1.getChildAt(0));
                  }
                  if (!seq1.getChildCount() == 0) { throw new Error('moving children failed'); }
                  module.log('parseCompoundStatement: grouping');
                }
                break;
              case INVERSION_MASK:
                if (seq2 != null) {
                  throw new ParseException('Inversion: illegal Inversion.', startPos, t.getEndPosition());
                } else {
                  grouping = new AST.InversionNode(ntn.getLayerCount(), startPos, t.getEndPosition());
                  for (let i = seq1.getChildCount() - 1; i >= 0; i--) {
                    grouping.add(seq1.getChildAt(0));
                  }
                  if (!seq1.getChildCount() == 0) { throw new Error('moving children failed'); }
                }
                break;
              case REFLECTION_MASK:
                if (seq2 != null) {
                  throw new ParseException('Reflection: illegal Reflection.', startPos, t.getEndPosition());
                } else {
                  grouping = new AST.ReflectionNode(ntn.getLayerCount(), startPos, t.getEndPosition());
                  for (let i = seq1.getChildCount() - 1; i >= 0; i--) {
                    grouping.add(seq1.getChildAt(0));
                  }
                  if (!seq1.getChildCount() == 0) { throw new Error('moving children failed'); }
                }
                break;
              case CONJUGATION_MASK:
                if (seq2 == null) {
                  throw new ParseException('Conjugation: Conjugate missing.', startPos, t.getEndPosition());
                } else {
                  grouping = new AST.ConjugationNode(ntn.getLayerCount(), seq1, seq2, startPos, t.getEndPosition());
                }
                break;
              case COMMUTATION_MASK:
                if (seq2 == null) {
                  if (seq1.getChildCount() == 2 && seq1.getSymbol() == Sym.SEQUENCE) {
                    grouping = new AST.CommutationNode(ntn.getLayerCount(), seq1.getChildAt(0), seq1.getChildAt(1), startPos, t.getEndPosition());
                  } else {
                    throw new ParseException(
                      'Commutation: Commutee missing.', startPos, t.getEndPosition());
                  }
                } else {
                  grouping = new AST.CommutationNode(ntn.getLayerCount(), seq1, seq2, startPos, t.getEndPosition());
                }
                break;
              case ROTATION_MASK:
                if (seq2 == null) {
                  throw new ParseException(
                    'Rotation: Rotatee missing.', startPos, t.getEndPosition());
                } else {
                  grouping = new AST.RotationNode(ntn.getLayerCount(), seq1, seq2, startPos, t.getEndPosition());
                }
                break;
              default:
                let ambiguous = '';
                if ((finalTypeMask & GROUPING_MASK) != 0) {
                  ambiguous += ('Grouping');
                }
                if ((finalTypeMask & INVERSION_MASK) != 0) {
                  if (ambiguous.length != 0) {
                    ambiguous += (' or ');
                  }
                  ambiguous += ('Inversion');
                }
                if ((finalTypeMask & REFLECTION_MASK) != 0) {
                  if (ambiguous.length != 0) {
                    ambiguous += (' or ');
                  }
                  ambiguous += ('Reflection');
                }
                if ((finalTypeMask & CONJUGATION_MASK) != 0) {
                  if (ambiguous.length != 0) {
                    ambiguous += (' or ');
                  }
                  ambiguous.append('Conjugation');
                }
                if ((finalTypeMask & COMMUTATION_MASK) != 0) {
                  if (ambiguous.length() != 0) {
                    ambiguous += (' or ');
                  }
                  ambiguous += ('Commutation');
                }
                if ((finalTypeMask & ROTATION_MASK) != 0) {
                  if (ambiguous.length() != 0) {
                    ambiguous += (' or ');
                  }
                  ambiguous += ('Rotation');
                }
                throw new ParseException('Compound Statement: Ambiguous compound statement, possibilities are ' + ambiguous + '.', startPos, t.getEndPosition());
            }
            parent.add(grouping);
            return grouping;
          }

          parseExpression(t, parent) {
            const ntn = this.notation;
            const Sym = Notation.Symbol;
            const Stx = Notation.Syntax;
            let expression = this.parseConstruct(t, parent);
            const ttype = t.nextToken();
            if (ttype == Tokenizer.TT_KEYWORD) {
              const symbols = t.getSymbolValue();
              if (ntn.isSyntax(Sym.COMMUTATION, Stx.PREINFIX) &&
              this.containsType(symbols, Sym.COMMUTATION_DELIMITER)) {
                const exp2 = this.parseExpression(t, parent);
                expression = new AST.CommutationNode(ntn.getLayerCount(), expression, exp2, expression.getStartPosition(), exp2.getEndPosition());
              } else if (ntn.isSyntax(Sym.CONJUGATION, Stx.PREINFIX) &&
              this.containsType(symbols, Sym.CONJUGATION_DELIMITER)) {
                const exp2 = this.parseExpression(t, parent);
                expression = new AST.ConjugationNode(ntn.getLayerCount(), expression, exp2, expression.getStartPosition(), exp2.getEndPosition());
              } else if (ntn.isSyntax(Sym.ROTATION, Stx.PREINFIX) &&
              this.containsType(symbols, Sym.ROTATION_DELIMITER)) {
                const exp2 = parseExpression(t, parent);
                expression = new AST.RotationNode(ntn.getLayerCount(), expression, exp2, expression.getStartPosition(), exp2.getEndPosition());
              } else if (ntn.isSyntax(Sym.COMMUTATION, Stx.POSTINFIX) &&
              this.containsType(symbols, Sym.COMMUTATION_DELIMITER)) {
                const exp2 = parseExpression(t, parent);
                expression = new AST.CommutationNode(ntn.getLayerCount(), exp2, expression, expression.getStartPosition(), exp2.getEndPosition());
              } else if (ntn.isSyntax(Sym.CONJUGATION, Stx.POSTINFIX) &&
              this.containsType(symbols, Sym.CONJUGATION_DELIMITER)) {
                const exp2 = parseExpression(t, parent);
                expression = new AST.ConjugationNode(ntn.getLayerCount(), exp2, expression, expression.getStartPosition(), exp2.getEndPosition());
              } else if (ntn.isSyntax(Sym.ROTATION, Stx.POSTINFIX) &&
              this.containsType(symbols, Sym.ROTATION_DELIMITER)) {
                const exp2 = parseExpression(t, parent);
                expression = new RotationNode(ntn.getLayerCount(), exp2, expression, expression.getStartPosition(), exp2.getEndPosition());
              } else {
                t.pushBack();
              }
            } else {
              t.pushBack();
            }
            parent.add(expression);
            return expression;
          }

          parseConstruct(t, parent) {
            const ntn = this.notation;
            const Sym = Notation.Symbol;
            const Stx = Notation.Syntax;
            let statement = null;
            const ttype = t.nextToken();
            const symbols = t.getSymbolValue();
            if (ttype == Tokenizer.TT_KEYWORD &&
            this.containsType(symbols, Sym.DELIMITER)) {
              statement = null;
            } else {
              statement = new AST.StatementNode(ntn.getLayerCount());
              parent.add(statement);
              statement.setStartPosition(t.getStartPosition());
              t.pushBack();
              let prefix = statement;
              let lastPrefix = statement;
              let guard = t.getInputLength();
              while ((prefix = this.parsePrefix(t, prefix)) != null) {
                guard = guard - 1;
                if (guard < 0) {
                  throw new Error('too many iterations');
                }
                lastPrefix = prefix;
              }
              const innerStatement = this.parseStatement(t, lastPrefix);
              statement.setEndPosition(innerStatement.getEndPosition());
              let child = statement.getChildAt(0);
              let suffix = statement;
              guard = t.getInputLength();
              while ((suffix = this.parseSuffix(t, statement)) != null) {
                guard = guard - 1;
                if (guard < 0) {
                  throw new Error('too many iterations');
                }
                suffix.add(child);
                child = suffix;
                statement.setEndPosition(suffix.getEndPosition());
              }
            }
            return statement;
          }

          parsePrefix(t, parent) {
            const ntn = this.notation;
            const Sym = Notation.Symbol;
            const Stx = Notation.Syntax;
            const ttype = t.nextToken();
            if (ttype == Tokenizer.TT_EOF) {
              return null;
            }
            const numericToken = null;
            if (ttype == Tokenizer.TT_NUMBER) {
              t.pushBack();
              if (ntn.isSyntax(Sym.REPETITION, Stx.PREFIX)) {
                return this.parseRepetitor(t, parent);
              } else {
                return null;
              }
            }
            if (ttype != Tokenizer.TT_KEYWORD) {
              t.pushBack();
              return null;
            }
            const symbols = t.getSymbolValue();
            t.pushBack();
            if (ntn.isSyntax(Sym.COMMUTATION, Stx.PREFIX) &&
            this.containsType(symbols, Sym.COMMUTATION_BEGIN)) {
              return this.parseExpressionAffix(t, parent);
            }
            if (ntn.isSyntax(Sym.CONJUGATION, Stx.PREFIX) &&
            this.containsType(symbols, Sym.CONJUGATION_BEGIN)) {
              return this.parseExpressionAffix(t, parent);
            }
            if (ntn.isSyntax(Sym.ROTATION, Stx.PREFIX) &&
            this.containsType(symbols, Sym.ROTATION_BEGIN)) {
              return this.parseExpressionAffix(t, parent);
            }
            if (ntn.isSyntax(Sym.INVERSION, Stx.PREFIX) &&
            this.containsType(symbols, Sym.INVERTOR)) {
              return this.parseInvertor(t, parent);
            }
            if (ntn.isSyntax(Sym.REPETITION, Stx.PREFIX) &&
            this.containsType(symbols, Sym.REPETITION_BEGIN)) {
              return this.parseRepetitor(t, parent);
            }
            if (ntn.isSyntax(Sym.REFLECTION, Stx.PREFIX) &&
            this.containsType(symbols, Sym, Sym.REFLECTOR)) {
              return this.parseReflector(t, parent);
            }
            return null;
          }

          parseSuffix(t, parent) {
            const ntn = this.notation;
            const Sym = Notation.Symbol;
            const Stx = Notation.Syntax;
            const ttype = t.nextToken();
            if (ttype == Tokenizer.TT_EOF) {
              return null;
            }
            const numericToken = null;
            if (ttype == Tokenizer.TT_NUMBER) {
              t.pushBack();
              if (ntn.isSyntax(Sym.REPETITION, Stx.SUFFIX)) {
                return this.parseRepetitor(t, parent);
              } else {
                return null;
              }
            }
            if (ttype != Tokenizer.TT_KEYWORD) {
              t.pushBack();
              return null;
            }
            const symbols = t.getSymbolValue();
            t.pushBack();
            if (ntn.isSyntax(Sym.COMMUTATION, Stx.SUFFIX) &&
            this.containsType(symbols, Sym.COMMUTATION_BEGIN)) {
              return this.parseExpressionAffix(t, parent);
            }
            if (ntn.isSyntax(Sym.CONJUGATION, Stx.SUFFIX) &&
            this.containsType(symbols, Sym.CONJUGATION_BEGIN)) {
              return this.parseExpressionAffix(t, parent);
            }
            if (ntn.isSyntax(Sym.ROTATION, Stx.SUFFIX) &&
            this.containsType(symbols, Sym.ROTATION_BEGIN)) {
              return this.parseExpressionAffix(t, parent);
            }
            if (ntn.isSyntax(Sym.INVERSION, Stx.SUFFIX) &&
            this.containsType(symbols, Sym.INVERTOR)) {
              return this.parseInvertor(t, parent);
            }
            if (ntn.isSyntax(Sym.REPETITION, Stx.SUFFIX) &&
            this.containsType(symbols, Sym.REPETITION_BEGIN)) {
              return this.parseRepetitor(t, parent);
            }
            if (ntn.isSyntax(Sym.REFLECTION, Stx.SUFFIX) &&
            this.containsType(symbols, Sym.REFLECTOR)) {
              return this.parseReflector(t, parent);
            }
            return null;
          }

          parseMacro(t, parent) {
            throw new ParseException('Macro: Not implemented ' + t.sval, t.getStartPosition(), t.getEndPosition());
          }

          parseRepetitor(t, parent) {
            const ntn = this.notation;
            const Sym = Notation.Symbol;
            if (!ntn.isSupported(Sym.REPETITION)) {
              return null;
            }
            const repetition = new AST.RepetitionNode(ntn.getLayerCount());
            parent.add(repetition);
            repetition.setStartPosition(t.getStartPosition());
            if (t.nextToken() != Tokenizer.TT_KEYWORD &&
            t.getTokenType() != Tokenizer.TT_NUMBER) {
              throw new ParseException('Repetitor: illegal begin.', t.getStartPosition(), t.getEndPosition());
            }
            let symbols = t.getSymbolValue();
            if (symbols != null && this.isType(symbols, Sym.REPETITION_BEGIN)) {
            } else {
              t.pushBack();
            }
            if (t.nextToken() != Tokenizer.TT_NUMBER) {
              throw new ParseException('Repetitor: Repeat count missing.', t.getStartPosition(), t.getEndPosition());
            }
            const intValue = t.getNumericValue();
            if (intValue < 1) {
              throw new ParseException('Repetitor: illegal repeat count ' + intValue, t.getStartPosition(), t.getEndPosition());
            }
            repetition.setRepeatCount(intValue);
            repetition.setEndPosition(t.getEndPosition());
            module.log('parseRepetitor count: ' + intValue);
            if (t.nextToken() != Tokenizer.TT_KEYWORD) {
              t.pushBack();
              return repetition;
            }
            symbols = t.getSymbolValue();
            if (this.isType(symbols, Sym.REPETITION_END)) {
            } else {
              t.pushBack();
            }
            return repetition;
          }

          parseInvertor(t, parent) {
            const ntn = this.notation;
            const Sym = Notation.Symbol;
            const inversion = new AST.InversionNode(ntn.getLayerCount());
            parent.add(inversion);
            inversion.setStartPosition(t.getStartPosition());
            if (t.nextToken() != Tokenizer.TT_KEYWORD) {
              throw new ParseException('Invertor: illegal begin.', t.getStartPosition(), t.getEndPosition());
            }
            const symbols = t.getSymbolValue();
            if (this.containsType(symbols, Sym.INVERTOR)) {
              module.log('parseInvertor: ' + t.getStringValue() + ' ' + t.getStartPosition() + '..' + t.getEndPosition());
              inversion.setEndPosition(t.getEndPosition());
              return inversion;
            }
            throw new ParseException('Invertor: illegal invertor ' + t.sval, t.getStartPosition(), t.getEndPosition());
          }

          parseReflector(t, parent) {
            const ntn = this.notation;
            const Sym = Notation.Symbol;
            const reflection = new AST.ReflectionNode(ntn.getLayerCount());
            parent.add(reflection);
            reflection.setStartPosition(t.getStartPosition());
            if (t.nextToken() != Tokenizer.TT_KEYWORD) {
              throw new ParseException('Reflector: illegal begin.', t.getStartPosition(), t.getEndPosition());
            }
            const symbols = t.getSymbolValue();
            if (this.containsType(symbols, Sym.REFLECTOR)) {
              module.log('parseReflector: ' + t.getStringValue() + ' ' + t.getStartPosition() + '..' + t.getEndPosition());
              reflection.setEndPosition(t.getEndPosition());
              return reflection;
            }
            throw new ParseException('Reflector: illegal reflection ' + t.sval, t.getStartPosition(), t.getEndPosition());
          }

          parseExpressionAffix(t, parent) {
            const ntn = this.notation;
            const Sym = Notation.Symbol;
            const Stx = Notation.Syntax;
            const startPosition = t.getStartPosition();
            if (t.nextToken() != Tokenizer.TT_KEYWORD) {
              throw new ParseException('Affix: Invalid begin.', t.getStartPosition(), t.getEndPosition());
            }
            let symbols = t.getSymbolValue();
            const endSymbols = [];
            if (this.containsType(symbols, Sym.CONJUGATION_BEGIN) &&
            (ntn.isSyntax(Sym.CONJUGATION, Stx.PREFIX) ||
              ntn.isSyntax(Sym.CONJUGATION, Stx.SUFFIX))) {
              endSymbols.push(Sym.CONJUGATION_END);
            }
            if (this.containsType(symbols, Sym.COMMUTATION_BEGIN) &&
            (ntn.isSyntax(Sym.COMMUTATION, Stx.PREFIX) ||
              ntn.isSyntax(Sym.COMMUTATION, Stx.SUFFIX))) {
              endSymbols.push(Sym.COMMUTATION_END);
            }
            if (this.containsType(symbols, Sym.ROTATION_BEGIN) &&
            (ntn.isSyntax(Sym.ROTATION, Stx.PREFIX) ||
              ntn.isSyntax(Sym.ROTATION, Stx.SUFFIX))) {
              endSymbols.push(Sym.ROTATION_END);
            }
            if (endSymbols.length == 0) {
              throw new ParseException('Affix: Invalid begin ' + t.sval, t.getStartPosition(), t.getEndPosition());
            }
            const operator = new AST.SequenceNode(ntn.getLayerCount());
            let endSymbol = null;
            Loop:
            do {
              this.parseExpression(t, operator);
              if (t.nextToken() != Tokenizer.TT_KEYWORD) {
                throw new ParseException('Affix: Statement missing.', t.getStartPosition(), t.getEndPosition());
              }
              symbols = t.getSymbolValue();
              for (let i = 0; i < endSymbols.length; i++) {
                endSymbol = endSymbols[i];
                if (this.containsType(symbols, endSymbol)) {
                  break Loop;
                }
              }
              t.pushBack();
            } while (token != null);
            let affix = null;
            if (endSymbol == Sym.CONJUGATION_END) {
              const cNode = new AST.ConjugationNode(ntn.getLayerCount());
              cNode.setConjugator(operator);
              affix = cNode;
            } else if (endSymbol == Sym.COMMUTATION_END) {
              const cNode = new AST.CommutationNode(ntn.getLayerCount());
              cNode.setCommutator(operator);
              affix = cNode;
            } else if (endSymbol == Sym.ROTATION_END) {
              const cNode = new AST.RotationNode(ntn.getLayerCount());
              cNode.setRotator(operator);
              affix = cNode;
            } else {
              throw new ParseException('Affix: Invalid end symbol ' + t.sval, t.getStartPosition(), t.getEndPosition());
            }
            affix.setStartPosition(startPosition);
            affix.setEndPosition(t.getEndPosition());
            parent.add(affix);
            return affix;
          }

          parseNOP(t, parent) {
            const ntn = this.notation;
            const Sym = Notation.Symbol;
            if (t.nextToken() != Tokenizer.TT_KEYWORD) {
              throw new ParseException('NOP: "' + t.getStringValue() + '" is a ' + t.getTokenType() + ' but not a keyword.', t.getStartPosition(), t.getEndPosition());
            }
            const symbols = t.getSymbolValue();
            if (!this.containsType(symbols, Sym.NOP)) {
              throw new ParseException('Move: "' + t.getStringValue() + '" is not a NOP', t.getStartPosition(), t.getEndPosition());
            }
            module.log('parseNOP: "' + t.getStringValue() + '".');
            const nop = new AST.NOPNode(ntn.getLayerCount(), t.getStartPosition(), t.getEndPosition());
            parent.add(nop);
            return nop;
          }

          parseMove(t, parent) {
            const ntn = this.notation;
            const move = new AST.MoveNode(ntn.getLayerCount());
            parent.add(move);
            if (t.nextToken() != Tokenizer.TT_KEYWORD) {
              throw new ParseException('Move: "' + t.getStringValue() + '" is a ' + t.getTokenType() + ' but not a keyword.', t.getStartPosition(), t.getEndPosition());
            }
            const symbols = t.getSymbolValue();
            let symbol = null;
            for (let i = 0; i < symbols.length; i++) {
              if (symbols[i].getType() == Notation.Symbol.MOVE) {
                symbol = symbols[i];
                break;
              }
            }
            if (symbol == null) {
              throw new ParseException('Move: "' + t.getStringValue() + '" is not a Move', t.getStartPosition(), t.getEndPosition());
            }
            module.log('parseMove: "%s".', t.getStringValue());
            move.setStartPosition(t.getStartPosition());
            move.setEndPosition(t.getEndPosition());
            move.setAxis(symbol.getAxis());
            move.setAngle(symbol.getAngle());
            move.setLayerMask(symbol.getLayerMask());
            return move;
          }
        }
        const createRandomScript = function (layerCount, scrambleCount, scrambleMinCount) {
          if (scrambleCount == null) { scrambleCount = 21; }
          if (scrambleMinCount == null) { scrambleMinCount = 6; }
          const scrambler = new Array(Math.floor(Math.random() * scrambleCount - scrambleMinCount) + scrambleMinCount);
          let prevAxis = -1;
          let axis, layerMask, angle;
          for (let i = 0; i < scrambleCount; i++) {
            while ((axis = Math.floor(Math.random() * 3)) == prevAxis) {
            }
            prevAxis = axis;
            layerMask = 1 << Math.floor(Math.random() * layerCount);
            while ((angle = Math.floor(Math.random() * 5) - 2) == 0) {
            }
            scrambler[i] = new AST.MoveNode(layerCount, axis, layerMask, angle);
          }
          return scrambler;
        };
        return {
          ParseException: ParseException,
          ScriptParser: ScriptParser,
          createRandomScript: createRandomScript,
          newTwistNode: (axis, layerMask, angle) => new AST.MoveNode(3, axis, layerMask, angle)
        };
      });
    'use strict';
    define('SplineInterpolator', [],
      function () {
        class SplineInterpolator {
          constructor(x1, y1, x2, y2) {
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
          }
        }
        SplineInterpolator.prototype.getFraction = function (t) {
          const invT = (1 - t);
          const b1 = 3 * t * (invT * invT);
          const b2 = 3 * (t * t) * invT;
          const b3 = t * t * t;
          const result = (b1 * this.y1) + (b2 * this.y2) + b3;
          return Math.min(1, Math.max(0, result));
        };
        return {
          newSplineInterpolator: function (x1, y1, x2, y2) { return new SplineInterpolator(x1, y1, x2, y2); }
        };
      });
    'use strict';
    define('Tokenizer', [],
      function () {
        const TT_WORD = 'word';
        const TT_EOF = 'eof';
        const TT_SKIP = 'skip';
        const TT_KEYWORD = 'keyword';
        const TT_NUMBER = 'number';
        const TT_COMMENT = 'comment';
        const TT_SPECIAL = 'special';
        const TT_COMMENT_BEGIN = 'commentBegin';
        const TT_DIGIT = 'numberDigit';
        class KeywordTree {
          constructor(keyword) {
            this.keyword = keyword;
            this.children = {};
          }
        }
        class Tokenizer {
          constructor() {
            this.specials = {};
            this.digits = {};
            this.commentBeginEnd = [];
            this.input = '';
            this.pos = 0;
            this.pushedBack = false;
            this.ttype = TT_EOF;
            this.tstart = 0;
            this.tend = 0;
            this.sval = null;
            this.nval = null;
            this.tsymbol = null;
            this.keywordTree = new KeywordTree(null);
            this.needChar = true;
          }

          addSpecial(token, ttype) {
            if (token.length != 1) { throw new 'token must be 1 character!, token:'() + token; }
            this.specials[token] = ttype;
          }

          addDigit(token, ttype) {
            if (token.length != 1) { throw new 'token must be 1 character!, token:'() + token; }
            this.digits[token] = ttype;
          }

          addNumbers() {
            this.addDigit('0', TT_DIGIT);
            this.addDigit('1', TT_DIGIT);
            this.addDigit('2', TT_DIGIT);
            this.addDigit('3', TT_DIGIT);
            this.addDigit('4', TT_DIGIT);
            this.addDigit('5', TT_DIGIT);
            this.addDigit('6', TT_DIGIT);
            this.addDigit('7', TT_DIGIT);
            this.addDigit('8', TT_DIGIT);
            this.addDigit('9', TT_DIGIT);
          }

          skipWhitespace() {
            this.addSpecial(' ', TT_SKIP);
            this.addSpecial('\f', TT_SKIP);
            this.addSpecial('\n', TT_SKIP);
            this.addSpecial('\r', TT_SKIP);
            this.addSpecial('\t', TT_SKIP);
            this.addSpecial('\v', TT_SKIP);
            this.addSpecial('\u00a0', TT_SKIP);
            this.addSpecial('\u2028', TT_SKIP);
            this.addSpecial('\u2029', TT_SKIP);
          }

          addKeyword(token, symbol) {
            let node = this.keywordTree;
            for (let i = 0; i < token.length; i++) {
              const ch = token.charAt(i);
              let child = node.children[ch];
              if (child == null) {
                child = new KeywordTree(null);
                node.children[ch] = child;
              }
              node = child;
            }
            node.keyword = token;
            node.symbol = symbol;
          }

          addKeywords(tokens) {
            for (let i = 0; i < tokens.length; i++) {
              this.addKeyword(tokens[i]);
            }
          }

          addSpecials(tokens) {
            for (let i = 0; i < tokens.length; i++) {
              this.addSpecial(tokens[i], tokens[i]);
            }
          }

          setInput(input) {
            this.input = input;
            this.pos = 0;
            this.pushedBack = false;
            this.ttype = null;
            this.tstart = null;
            this.tend = null;
            this.sval = null;
            this.tsymbol = null;
            this.needChar = true;
          }

          getInputLength() {
            return this.input.length;
          }

          getTokenType() {
            return this.ttype;
          }

          getStringValue() {
            return this.sval;
          }

          getNumericValue() {
            return this.nval;
          }

          getSymbolValue() {
            return this.tsymbol;
          }

          getStartPosition() {
            return this.tstart;
          }

          getEndPosition() {
            return this.tend;
          }

          nextToken() {
            if (this.pushedBack) {
              this.pushedBack = false;
              return this.ttype;
            }
            let start = this.pos;
            let ch = this.read();
            while (ch != null && this.specials[ch] == TT_SKIP) {
              ch = this.read();
              start += 1;
            }
            let node = this.keywordTree;
            let foundNode = null;
            let end = start;
            while (ch != null && node.children[ch] != null) {
              node = node.children[ch];
              if (node.keyword != null) {
                foundNode = node;
                end = this.pos;
              }
              ch = this.read();
            }
            if (foundNode != null) {
              this.setPosition(end);
              this.ttype = TT_KEYWORD;
              this.tstart = start;
              this.tend = end;
              this.sval = foundNode.keyword;
              this.tsymbol = foundNode.symbol;
              return this.ttype;
            }
            this.setPosition(start);
            ch = this.read();
            if (ch != null && this.digits[ch] == TT_DIGIT) {
              while (ch != null && this.digits[ch] == TT_DIGIT) {
                ch = this.read();
              }
              if (ch != null) {
                this.unread();
              }
              this.ttype = TT_NUMBER;
              this.tstart = start;
              this.tend = this.pos;
              this.sval = this.input.substring(start, this.pos);
              this.nval = parseInt(this.sval);
              this.tsymbol = null;
              return this.ttype;
            }
            if (ch != null && this.specials[ch] == null) {
              while (ch != null && this.specials[ch] == null) {
                ch = this.read();
              }
              if (ch != null) {
                this.unread();
              }
              this.ttype = TT_WORD;
              this.tstart = start;
              this.tend = this.pos;
              this.sval = this.input.substring(start, this.pos);
              this.tsymbol = null;
              return this.ttype;
            }
            if (ch != null && this.specials[ch] != null) {
              this.ttype = TT_SPECIAL;
              this.tsymbol = this.specials[ch];
              this.tstart = start;
              this.tend = end;
              this.sval = ch;
              return this.ttype;
            }
            this.ttype = TT_EOF;
            return this.ttype;
          }

          read() {
            if (this.pos < this.input.length) {
              const ch = this.input.charAt(this.pos);
              this.pos = this.pos + 1;
              return ch;
            } else {
              this.pos = this.input.length;
              return null;
            }
          }

          unread() {
            if (this.pos > 0) {
              this.pos = this.pos - 1;
            }
          }

          setPosition(newValue) {
            this.pos = newValue;
          }

          pushBack() {
            this.pushedBack = true;
          }
        }
        class PushBackReader {
          constructor(str) {
            this.str = str;
            this.pos = 0;
            this.ch = null;
            this.pushedBack = false;
          }

          read() {
            if (this.pushedBack) {
              this.pushedBack = false;
              return this.ch;
            }
            if (this.pos < this.str.length) {
              this.ch = this.str.charAt(this.pos++);
            } else {
              this.ch = null;
            }
            return this.ch;
          }

          pushBack() {
            this.pushedBack = true;
          }

          skipWhitespace() {
            let c = this.read();
            while (c == ' ' || c == '\n' || c == '\t') {
              c = this.read();
            }
            this.pushBack();
          }

          getChar() {
            return this.ch;
          }

          getPosition() {
            return this.pos;
          }
        }
        return {
          TT_WORD: TT_WORD,
          TT_KEYWORD: TT_KEYWORD,
          TT_SKIP: TT_SKIP,
          TT_EOF: TT_EOF,
          TT_NUMBER: TT_NUMBER,
          TT_COMMENT: TT_COMMENT,
          Tokenizer: Tokenizer,
          PushBackReader: PushBackReader
        };
      });
    'use strict';
    define('TwoDPlayerApplet', ['AbstractPlayerApplet', 'Node3D', 'J3DI'],
      function (AbstractPlayerApplet, Node3D, J3DI) {
        class TwoDPlayerApplet extends AbstractPlayerApplet.AbstractPlayerApplet {
          constructor() {
            super();
            this.initTwoDCube3DCanvas();
          }
        }
        TwoDPlayerApplet.prototype.initTwoDCube3DCanvas = function () {
          this.g = null;
          this.useFullModel = false;
        };
        TwoDPlayerApplet.prototype.openCanvas = function () {
          this.g = this.canvas.getContext('2d');
          if (this.g == null) return false;
          this.g.imageSmoothingEnabled = false;
          this.g.mozImageSmoothingEnabled = false;
          this.g.webkitImageSmoothingEnabled = false;
          this.deferredFaceCount = 0;
          this.deferredFaces = [];
          this.mvVertexArray = new J3DIVertexArray();
          this.mvpVertexArray = new J3DIVertexArray();
          this.initScene();
          if (this.initCallback != null) {
            this.initCallback(this);
          }
          this.draw();
          return true;
        };
        TwoDPlayerApplet.prototype.closeCanvas = function () {
        };
        TwoDPlayerApplet.prototype.reshape = function () {
          const canvas = this.canvas;
          const devicePixelRatio = window.devicePixelRatio || 1;
          this.drawingBufferWidth = canvas.clientWidth * devicePixelRatio;
          this.drawingBufferHeight = canvas.clientHeight * devicePixelRatio;
          if (this.drawingBufferWidth == this.width && this.drawingBufferHeight == this.height) {
            return;
          }
          canvas.width = this.drawingBufferWidth;
          canvas.height = this.drawingBufferHeight;
          this.width = canvas.clientWidth;
          this.height = canvas.clientHeight;
          this.viewportMatrix = new J3DIMatrix4();
          this.viewportMatrix.scale(this.canvas.width * 0.5, this.canvas.height * 0.5);
          this.viewportMatrix.translate(1, 1);
          this.viewportMatrix.scale(1, -1);
        };
        TwoDPlayerApplet.prototype.clearCanvas = function () {
          const g = this.g;
          g.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };
        TwoDPlayerApplet.prototype.flushCanvas = function () {
          const g = this.g;
          const tri = this.deferredFaces.splice(0, this.deferredFaceCount);
          tri.sort(function (a, b) { return b.depth - a.depth; });
          for (let i = 0; i < tri.length; i++) {
            tri[i].draw(g);
          }
          this.deferredFaceCount = 0;
        };
        /** Draws the scene. * /
  TwoDPlayerApplet.prototype.drawSinglePassOFF = function() {
    if (!this.camPos) return;
    this.reshape();
    this.updateMatrices();
    var self=this;
    var g=this.g;
    g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.deferredFaceCount = 0;
    var cube3d=this.cube3d;
    cube3d.repainter=this;
    cube3d.validateAttributes();
    var attr=cube3d.attributes;
    var ccenter=attr.partsFillColor[cube3d.centerOffset];
    var cparts=attr.partsFillColor[cube3d.cornerOffset];
    var mvMatrix=this.mvMatrix;
    for (var i=0;i<this.cube3d.centerCount;i++) {
      mvMatrix.makeIdentity();
      cube3d.parts[cube3d.centerOffset+i].transform(mvMatrix);
      this.drawObject(cube3d.centerObj, mvMatrix, ccenter,attr.partsPhong[cube3d.centerOffset+i]);
    }
    for (var i=0;i<cube3d.sideCount;i++) {
        mvMatrix.makeIdentity();
        cube3d.parts[cube3d.sideOffset+i].transform(mvMatrix);
        this.drawObject(cube3d.sideObj, mvMatrix, cparts, attr.partsPhong[cube3d.sideOffset+i]);
        var si=cube3d.getStickerIndexForPartIndex(cube3d.sideOffset+i,0);
        this.drawObject(cube3d.stickerObjs[si], mvMatrix,
                        attr.stickersFillColor[si],
                        attr.stickersPhong[si]);
    }
    for (var i=0;i<cube3d.edgeCount;i++) {
        mvMatrix.makeIdentity();
        this.cube3d.parts[cube3d.edgeOffset+i].transform(mvMatrix);
        this.drawObject(cube3d.edgeObj, mvMatrix, cparts, attr.partsPhong[this.cube3d.edgeOffset+i]);
        var si=cube3d.getStickerIndexForPartIndex(cube3d.edgeOffset+i,0);
        this.drawObject(cube3d.stickerObjs[si], mvMatrix,
                        attr.stickersFillColor[si],
                        attr.stickersPhong[si]);
        si=cube3d.getStickerIndexForPartIndex(cube3d.edgeOffset+i,1);
        this.drawObject(cube3d.stickerObjs[si], mvMatrix,
                        attr.stickersFillColor[si],
                        attr.stickersPhong[si]);
    }
    for (var i=0;i<cube3d.cornerCount;i++) {
        mvMatrix.makeIdentity();
        this.cube3d.parts[cube3d.cornerOffset+i].transform(mvMatrix);
        this.drawObject(cube3d.cornerObj, mvMatrix, cparts, attr.partsPhong[this.cube3d.cornerOffset+i],this.forceColorUpdate);
        var si=cube3d.getStickerIndexForPartIndex(cube3d.cornerOffset+i,1);
        this.drawObject(cube3d.stickerObjs[si], mvMatrix, attr.stickersFillColor[si], attr.stickersPhong[si],this.forceColorUpdate);
        si=cube3d.getStickerIndexForPartIndex(cube3d.cornerOffset+i,0);
        this.drawObject(cube3d.stickerObjs[si], mvMatrix, attr.stickersFillColor[si], attr.stickersPhong[si],this.forceColorUpdate);
        si=cube3d.getStickerIndexForPartIndex(cube3d.cornerOffset+i,2);
        this.drawObject(cube3d.stickerObjs[si], mvMatrix, attr.stickersFillColor[si], attr.stickersPhong[si],this.forceColorUpdate);
    }
    this.forceColorUpdate=false;
    var tri = this.deferredFaces.splice(0,this.deferredFaceCount);
    tri.sort(function(a,b){return b.depth - a.depth});
    for (var i=0;i<tri.length;i++) {
      tri[i].draw(g);
    }
  }
  */
        /** Draws the scene. * /
  TwoDPlayerApplet.prototype.drawTwoPassOFF = function() {
    if (!this.camPos) return;
    this.reshape();
    this.updateMatrices();
    var self=this;
    var g=this.g;
    g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.deferredFaceCount = 0;
    var cube3d=this.cube3d;
    cube3d.repainter=this;
    cube3d.validateAttributes();
    var attr=cube3d.attributes;
    var ccenter=attr.partsFillColor[cube3d.centerOffset];
    var cparts=attr.partsFillColor[cube3d.cornerOffset];
    var mvMatrix=this.mvMatrix;
  {
    for (var i=0;i<this.cube3d.centerCount;i++) {
      mvMatrix.makeIdentity();
      cube3d.parts[cube3d.centerOffset+i].transform(mvMatrix);
      this.drawObject(cube3d.centerObj, mvMatrix, ccenter,attr.partsPhong[cube3d.centerOffset+i]);
    }
    for (var i=0;i<cube3d.sideCount;i++) {
        mvMatrix.makeIdentity();
        cube3d.parts[cube3d.sideOffset+i].transform(mvMatrix);
        this.drawObject(cube3d.sideObj, mvMatrix, cparts, attr.partsPhong[cube3d.sideOffset+i]);
    }
    for (var i=0;i<cube3d.edgeCount;i++) {
        mvMatrix.makeIdentity();
        this.cube3d.parts[cube3d.edgeOffset+i].transform(mvMatrix);
        this.drawObject(cube3d.edgeObj, mvMatrix, cparts, attr.partsPhong[this.cube3d.edgeOffset+i]);
    }
    for (var i=0;i<cube3d.cornerCount;i++) {
        mvMatrix.makeIdentity();
        this.cube3d.parts[cube3d.cornerOffset+i].transform(mvMatrix);
        this.drawObject(cube3d.cornerObj, mvMatrix, cparts, attr.partsPhong[this.cube3d.cornerOffset+i],this.forceColorUpdate);
    }
    var tri = this.deferredFaces.splice(0,this.deferredFaceCount);
    tri.sort(function(a,b){return b.depth - a.depth});
    for (var i=0;i<tri.length;i++) {
      tri[i].draw(g);
    }
  }
    for (var i=0;i<cube3d.sideCount;i++) {
        mvMatrix.makeIdentity();
        cube3d.parts[cube3d.sideOffset+i].transform(mvMatrix);
        var si=cube3d.getStickerIndexForPartIndex(cube3d.sideOffset+i,0);
        this.drawObject(cube3d.stickerObjs[si], mvMatrix,
                        attr.stickersFillColor[si],
                        attr.stickersPhong[si]);
    }
    for (var i=0;i<cube3d.edgeCount;i++) {
        mvMatrix.makeIdentity();
        this.cube3d.parts[cube3d.edgeOffset+i].transform(mvMatrix);
        var si=cube3d.getStickerIndexForPartIndex(cube3d.edgeOffset+i,0);
        this.drawObject(cube3d.stickerObjs[si], mvMatrix,
                        attr.stickersFillColor[si],
                        attr.stickersPhong[si]);
        si=cube3d.getStickerIndexForPartIndex(cube3d.edgeOffset+i,1);
        this.drawObject(cube3d.stickerObjs[si], mvMatrix,
                        attr.stickersFillColor[si],
                        attr.stickersPhong[si]);
    }
    for (var i=0;i<cube3d.cornerCount;i++) {
        mvMatrix.makeIdentity();
        this.cube3d.parts[cube3d.cornerOffset+i].transform(mvMatrix);
        var si=cube3d.getStickerIndexForPartIndex(cube3d.cornerOffset+i,1);
        this.drawObject(cube3d.stickerObjs[si], mvMatrix, attr.stickersFillColor[si], attr.stickersPhong[si],this.forceColorUpdate);
        si=cube3d.getStickerIndexForPartIndex(cube3d.cornerOffset+i,0);
        this.drawObject(cube3d.stickerObjs[si], mvMatrix, attr.stickersFillColor[si], attr.stickersPhong[si],this.forceColorUpdate);
        si=cube3d.getStickerIndexForPartIndex(cube3d.cornerOffset+i,2);
        this.drawObject(cube3d.stickerObjs[si], mvMatrix, attr.stickersFillColor[si], attr.stickersPhong[si],this.forceColorUpdate);
    }
    this.forceColorUpdate=false;
    var tri = this.deferredFaces.splice(0,this.deferredFaceCount);
    tri.sort(function(a,b){return b.depth - a.depth});
    for (var i=0;i<tri.length;i++) {
      tri[i].draw(g);
    }
  }
  */
        TwoDPlayerApplet.prototype.drawObject = function (obj, mvMatrix, color, phong, forceColorUpdate) {
          this.drawObjectCanvas2D(obj, mvMatrix, color, phong, forceColorUpdate);
        };
        return {
          TwoDPlayerApplet: TwoDPlayerApplet
        };
      });
    'use strict';
    define('VirtualCubeMain', ['WebglPlayerApplet', 'TwoDPlayerApplet'],
      function (WebglPlayerApplet, TwoDPlayerApplet) {
        const module = {
          log: (false) ? console.log : () => {},
          info: (true) ? console.info : () => {},
          warning: (true) ? console.warning : () => {},
          error: (true) ? console.error : () => {}
        };
        let nextId = 0;
        function attachVirtualCube(parameters, divOrCanvas) {
          if (parameters == null) {
            parameters = [];
          }
          if (document.body == null) {
            var f = function () {
              try {
                window.removeEventListener('load', f, false);
              } catch (err) {
                window.detachEvent('onload', f, false);
              }
              attachVirtualCube(parameters, divOrCanvas);
            };
            try {
              window.addEventListener('load', f, false);
            } catch (err) {
              window.attachEvent('onload', f, false);
            }
            return;
          }
          if (divOrCanvas == null) {
            try {
              var htmlCollection = document.getElementsByClassName('virtualcube');
              if (htmlCollection.length == 0) {
                module.error('no canvas or div element with class name "virtualcube" found.');
                return;
              }
            } catch (err) {
              return;
            }
            for (let i = 0; i < htmlCollection.length; i++) {
              const elem = htmlCollection[i];
              attachVirtualCube(parameters, elem);
            }
          } else {
            let canvasElem = null;
            if (divOrCanvas.tagName == 'CANVAS') {
              canvasElem = divOrCanvas;
            } else if (divOrCanvas.tagName == 'DIV') {
              while (divOrCanvas.lastChild) {
                divOrCanvas.removeChild(divOrCanvas.lastChild);
              }
              const id = 'virtualcube_' + nextId++;
              canvasElem = document.createElement('canvas');
              canvasElem.setAttribute('class', 'cube-canvas');
              canvasElem.setAttribute('id', id);
              for (let i = 0; i < divOrCanvas.attributes.length; i++) {
                const attr = divOrCanvas.attributes[i];
                if (attr.name != 'id' && attr.name != 'class') {
                  module.log('.attachVirtualCube copying attribute attr.name:' + attr.name + ' attr.value:' + attr.value);
                  canvasElem.setAttribute(attr.name, attr.value);
                }
              }
              if (!divOrCanvas.hasAttribute('width')) {
                canvasElem.setAttribute('width', '220');
              }
              if (!divOrCanvas.hasAttribute('height')) {
                canvasElem.setAttribute('height', '220');
              }
              if (!divOrCanvas.hasAttribute('kind')) {
                canvasElem.setAttribute('kind', divOrCanvas.getAttribute('kind'));
              }
              if (!divOrCanvas.hasAttribute('debug')) {
                canvasElem.setAttribute('debug', '');
              }
              divOrCanvas.appendChild(canvasElem);
              const toolbarElem = document.createElement('div');
              toolbarElem.setAttribute('class', 'button-toolbar');
              divOrCanvas.appendChild(toolbarElem);
              let buttonElem;
              buttonElem = document.createElement('button');
              buttonElem.setAttribute('type', 'button');
              buttonElem.setAttribute('class', 'reset-button');
              buttonElem.setAttribute('onclick', "document.getElementById('" + id + "').virtualcube.reset();");
              buttonElem.appendChild(document.createTextNode('Reset'));
              toolbarElem.appendChild(buttonElem);
              buttonElem = document.createElement('button');
              buttonElem.setAttribute('type', 'button');
              buttonElem.setAttribute('class', 'undo-button');
              buttonElem.setAttribute('onclick', "document.getElementById('" + id + "').virtualcube.undo();");
              buttonElem.appendChild(document.createTextNode('Undo'));
              toolbarElem.appendChild(buttonElem);
              buttonElem = document.createElement('button');
              buttonElem.setAttribute('type', 'button');
              buttonElem.setAttribute('class', 'redo-button');
              buttonElem.setAttribute('onclick', "document.getElementById('" + id + "').virtualcube.redo();");
              buttonElem.appendChild(document.createTextNode('Redo'));
              toolbarElem.appendChild(buttonElem);
              buttonElem = document.createElement('button');
              buttonElem.setAttribute('type', 'button');
              buttonElem.setAttribute('class', 'scramble-button');
              buttonElem.setAttribute('onclick', "document.getElementById('" + id + "').virtualcube.scramble();");
              buttonElem.appendChild(document.createTextNode('Scramble'));
              toolbarElem.appendChild(buttonElem);
            } else {
              module.error('element ' + divOrCanvas + ' is not a canvas or a div. tagName=' + divOrCanvas.tagName);
              return;
            }
            const vr = new VirtualCube(canvasElem);
            vr.parameters = [];
            for (const key in parameters) {
              vr.parameters[key] = parameters[key];
            }
            for (let i = 0; i < divOrCanvas.attributes.length; i++) {
              const attr = divOrCanvas.attributes[i];
              if (attr.name != 'id' && attr.name != 'class') {
                module.log('.attachVirtualCube copying parameter attr.name:' + attr.name + ' attr.value:' + attr.value);
                vr.parameters[attr.name] = attr.value;
              }
            }
            vr.init();
            canvasElem.virtualcube = vr;
          }
        }
        class VirtualCube {
          constructor(canvas) {
            this.canvas = canvas;
            this.parameters = { baseurl: 'lib' };
          }
        }
        VirtualCube.prototype.init = function () {
          const rendercontext = this.parameters.rendercontext;
          module.log('reading parameter rendercontext:' + rendercontext);
          if (rendercontext == '2d') {
            this.canvas3d = new TwoDPlayerApplet.TwoDPlayerApplet();
          } else if (rendercontext == null || rendercontext == 'webgl') {
            this.canvas3d = new WebglPlayerApplet.WebglPlayerApplet();
          } else {
            module.error('illegal rendercontext:' + rendercontext);
            this.canvas3d = new WebglPlayerApplet.WebglPlayerApplet();
          }
          for (var k in this.parameters) {
            this.canvas3d.parameters[k] = this.parameters[k];
          }
          let s = this.canvas3d.setCanvas(this.canvas);
          if (!s) {
            module.log('Could not instantiate WebGL Context, falling back to 2D Context');
            for (var k in this.parameters) {
              this.canvas3d.parameters[k] = this.parameters[k];
            }
            this.canvas3d = new TwoDPlayerApplet.TwoDPlayerApplet();
            for (var k in this.parameters) {
              this.canvas3d.parameters[k] = this.parameters[k];
            }
            s = this.canvas3d.setCanvas(this.canvas);
          }
        };
        VirtualCube.prototype.reset = function () {
          this.canvas3d.reset();
        };
        VirtualCube.prototype.scramble = function (scrambleCount, animate) {
          this.canvas3d.scramble(scrambleCount, animate);
        };
        VirtualCube.prototype.undo = function () {
          this.canvas3d.undo();
        };
        VirtualCube.prototype.redo = function () {
          this.canvas3d.redo();
        };
        VirtualCube.prototype.play = function () {
          this.canvas3d.play();
        };
        VirtualCube.prototype.solveStep = function () {
          this.canvas3d.solveStep();
        };
        VirtualCube.prototype.wobble = function () {
          this.canvas3d.wobble();
        };
        VirtualCube.prototype.explode = function () {
          this.canvas3d.explode();
        };
        VirtualCube.prototype.setAutorotate = function (newValue) {
          this.canvas3d.setAutorotate(newValue);
        };
        return {
          attachVirtualCube: attachVirtualCube
        };
      });
    'use strict';
    define('WebglPlayerApplet', ['AbstractPlayerApplet', 'Node3D', 'J3DI', 'PreloadWebglShaders'],
      function (AbstractPlayerApplet, Node3D, J3DI, PreloadWebglShaders) {
        const module = {
          log: (false) ? console.log : () => {
          },
          info: (true) ? console.info : () => {
          },
          warning: (true) ? console.warning : () => {
          },
          error: (true) ? console.error : () => {
          }
        };
        class WebglPlayerApplet extends AbstractPlayerApplet.AbstractPlayerApplet {
          constructor() {
            super();
            this.gl = null;
          }
        }
        const TEXTURE_PROGRAM = 0;
        const PHONG_PROGRAM = 1;
        WebglPlayerApplet.prototype.openCanvas = function () {
          const self = this;
          const container = this.canvas.parentNode;
          module.log('baseurl: %s', this.parameters.baseurl);
          this.gl = J3DI.initWebGL(
            this.canvas,
            [this.parameters.baseurl + '/shaders/texture.vert', this.parameters.baseurl + '/shaders/phong.vert'],
            [this.parameters.baseurl + '/shaders/texture.frag', this.parameters.baseurl + '/shaders/phong.frag'],
            ['vPos', 'vNormal', 'vColor', 'vTexture'],
            ['camPos', 'lightPos', 'mvMatrix', 'mvNormalMatrix', 'mvpMatrix', 'mPhong', 'mTexture', 'mHasTexture'],
            [0, 0, 0, 0],
            10000,
            { antialias: true },
            function (gl) {
              self.gl = gl;
              self.checkGLError('initWebGLCallback');
              self.checkGLError('beforeInitScene');
              const prg = gl.programs[PHONG_PROGRAM];
              gl.useProgram(prg);
              self.initScene();
              const attr = self.cube3d.attributes;
              gl.clearColor(attr.backgroundColor[0], attr.backgroundColor[1], attr.backgroundColor[2], attr.backgroundColor[3]);
              self.checkGLError('afterInitScene');
              if (self.initCallback != null) {
                self.initCallback(self);
              }
              self.draw();
            },
            function (msg) {
              self.gl = null;
            }
          );
          return this.gl != null;
        };
        WebglPlayerApplet.prototype.closeCanvas = function () {
        };
        WebglPlayerApplet.prototype.reshape = function () {
          const gl = this.gl;
          const canvas = this.canvas;
          const devicePixelRatio = window.devicePixelRatio || 1;
          this.drawingBufferWidth = canvas.clientWidth * devicePixelRatio;
          this.drawingBufferHeight = canvas.clientHeight * devicePixelRatio;
          if (this.drawingBufferWidth == this.width && this.drawingBufferHeight == this.height) {
            return;
          }
          canvas.width = this.drawingBufferWidth;
          canvas.height = this.drawingBufferHeight;
          this.width = canvas.clientWidth;
          this.height = canvas.clientHeight;
          gl.viewport(0, 0, this.drawingBufferWidth, this.drawingBufferHeight);
          this.checkGLError('reshape');
        };
        WebglPlayerApplet.prototype.clearCanvas = function () {
          const gl = this.gl;
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          this.checkGLError('draw gl.clear');
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
          gl.enable(gl.CULL_FACE);
          gl.cullFace(gl.BACK);
          this.checkGLError('draw gl.cullFace');
          for (let i = 0; i < gl.programs.length; i++) {
            const prg = gl.programs[i];
            if (i == TEXTURE_PROGRAM && this.stickersTexture == null) {
              continue;
            }
            if (prg == null) {
              module.log('.clearCanvas **warning** vertex shader not loaded (yet)');
              return;
            }
            gl.useProgram(prg);
            this.checkGLError('draw useProgram');
            gl.uniform3f(prg.uniforms.camPos, this.camPos[0], this.camPos[1], this.camPos[2]);
            this.checkGLError('draw camPos');
            gl.uniform3f(prg.uniforms.lightPos, this.lightPos[0], this.lightPos[1], this.lightPos[2]);
            this.checkGLError('draw lightPos');
          }
        };
        WebglPlayerApplet.prototype.flushCanvas = function () {
          const gl = this.gl;
          gl.flush();
        };
        WebglPlayerApplet.prototype.drawObject = function (obj, mvMatrix, color, phong, forceColorUpdate) {
          if (obj == null || !obj.visible) { return; }
          if (!obj.loaded) { return; }
          const gl = this.gl;
          const prg = gl.programs[this.stickersTexture != null ? TEXTURE_PROGRAM : PHONG_PROGRAM];
          obj.bindGL(gl);
          gl.useProgram(prg);
          if (obj.textureScale != null) {
            const textureArray = new Array(obj.textureArray.length);
            for (let i = 0; i < textureArray.length; i += 2) {
              textureArray[i] = (obj.textureArray[i] + obj.textureOffsetX) * obj.textureScale;
              textureArray[i + 1] = (obj.textureArray[i + 1] + obj.textureOffsetY) * obj.textureScale;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.textureBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureArray), gl.STATIC_DRAW);
            obj.textureScale = null;
          }
          if (obj.colorBuffer == null || forceColorUpdate) {
            let colors = Array(obj.numIndices * 4);
            for (let i = 0; i < obj.numIndices; i++) {
              if (color == null) {
                colors[i * 4] = Math.random() * 255;
                colors[i * 4 + 1] = Math.random() * 255;
                colors[i * 4 + 2] = Math.random() * 255;
                colors[i * 4 + 3] = 255.0;
              } else {
                colors[i * 4] = color[0];
                colors[i * 4 + 1] = color[1];
                colors[i * 4 + 2] = color[2];
                colors[i * 4 + 3] = color[3];
              }
            }
            colors = new Float32Array(colors);
            if (obj.colorBuffer == null) {
              obj.colorBuffer = gl.createBuffer();
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
          }
          this.checkGLError('virtualrubik.js::drawObject.before mPhong');
          gl.uniform4f(prg.uniforms.mPhong, phong[0], phong[1], phong[2], phong[3]);
          this.checkGLError('mPhong');
          gl.uniformMatrix4fv(prg.uniforms.mvMatrix, false, mvMatrix.getAsFloat32Array());
          this.checkGLError('mvMatrix');
          this.mvpMatrix.load(this.perspectiveMatrix);
          this.mvpMatrix.multiply(mvMatrix);
          gl.uniformMatrix4fv(prg.uniforms.mvpMatrix, false, this.mvpMatrix.getAsFloat32Array());
          this.checkGLError('mvpMatrix');
          this.mvNormalMatrix.load(mvMatrix);
          this.mvNormalMatrix.invert();
          this.mvNormalMatrix.transpose();
          gl.uniformMatrix4fv(prg.uniforms.mvNormalMatrix, false, this.mvNormalMatrix.getAsFloat32Array());
          this.checkGLError('mvNormalMatrix');
          if (this.stickersTexture != null) {
            if (prg.uniforms.mTexture) {
              gl.activeTexture(gl.TEXTURE0);
              gl.bindTexture(gl.TEXTURE_2D, this.stickersTexture);
              gl.uniform1i(prg.uniforms.mTexture, 0);
              this.checkGLError('mTexture');
            }
          }
          if (prg.uniforms.mHasTexture) {
            gl.uniform1i(prg.uniforms.mHasTexture, obj.hasTexture ? 1 : 0);
            this.checkGLError('drawObject mHasTexture');
          }
          if (prg.attribs.vPos >= 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
            gl.enableVertexAttribArray(prg.attribs.vPos);
            gl.vertexAttribPointer(prg.attribs.vPos, 3, gl.FLOAT, false, 0, 0);
            this.checkGLError('drawObject vPos');
          }
          if (prg.attribs.vNormal >= 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
            gl.enableVertexAttribArray(prg.attribs.vNormal);
            gl.vertexAttribPointer(prg.attribs.vNormal, 3, gl.FLOAT, false, 0, 0);
            this.checkGLError('drawObject vNormal');
          }
          if (prg.attribs.vColor >= 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
            gl.enableVertexAttribArray(prg.attribs.vColor);
            gl.vertexAttribPointer(prg.attribs.vColor, 4, gl.FLOAT, false, 0, 0);
            this.checkGLError('drawObject vColor');
          }
          if (prg.attribs.vTexture >= 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.textureBuffer);
            gl.enableVertexAttribArray(prg.attribs.vTexture);
            gl.vertexAttribPointer(prg.attribs.vTexture, 2, gl.FLOAT, false, 0, 0);
            this.checkGLError('drawObject vTexture');
          }
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);
          gl.drawElements(gl.TRIANGLES, obj.numIndices, gl.UNSIGNED_SHORT, 0);
          this.checkGLError('drawObject.drawElements vshader=' + prg.vshaderId + ' fshader=' + prg.fshaderId);
        };
        WebglPlayerApplet.prototype.checkGLError = function (msg) {
          if (this.checkForErrors) {
            const gl = this.gl;
            const error = gl.getError();
            if (error != gl.NO_ERROR) {
              const str = 'GL Error: ' + error + (msg == null ? '' : ' ' + msg);
              module.log(str);
              gl.hasError = true;
            }
          }
        };
        WebglPlayerApplet.prototype.clearGLError = function (msg) {
          const gl = this.gl;
          const error = gl.getError();
          gl.hasError = false;
        };
        return {
          WebglPlayerApplet: WebglPlayerApplet
        };
      });
    'use strict';
    let baseUrl = 'lib';
    {
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        if (script.src != null) {
          const p = script.src.indexOf('virtualcube.js');
          if (p != -1) {
            baseUrl = script.src.substring(0, p - 1);
            break;
          }
        }
      }
    }
    requirejs.config({
      baseUrl: baseUrl
    });
    requirejs(['VirtualCubeMain'],
      function (VirtualCubeMain) {
        const parameters = {};
        parameters.baseurl = baseUrl;
        VirtualCubeMain.attachVirtualCube(parameters);
      });
  }
}
