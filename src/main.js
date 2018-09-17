import console from 'console';
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    Raycaster,
    Vector2,
} from 'three';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { timer } from 'rxjs/observable/timer';
import { startWith } from 'rxjs/operators/startWith';
import { scan } from 'rxjs/operators/scan';
import { filter } from 'rxjs/operators/filter';
import { map } from 'rxjs/operators/map';
import { mergeMap } from 'rxjs/operators/mergeMap';
import { first } from 'rxjs/operators/first';
import { auditTime } from 'rxjs/operators/auditTime';
import { timeInterval } from 'rxjs/operators/timeInterval';
import { fromJS } from 'immutable';
import { create as matrixCreate, toList as matrixToList, map as matrixMap } from './core/matrix';
import { nextSnapshot } from './core/snapshots';

const boxDimension = {
    w: 5,
    h: 5,
};
const matr = {
    r: 10,
    c: 10,
};
const display = window;

/*
* Coordinates normalizations functions
* */

const matrixToWorld = ({ x = 0, y = 0, z = 0 }) => ({
    x: -boxDimension.w * -(x - matr.r / 2),
    y: boxDimension.h * -(y - matr.c / 2),
    z,
});

const worldToMatrix = ({ x = 0, y = 0, z = 0 }) => ({
    x: (x / boxDimension.w + matr.r / 2),
    y: -(y / boxDimension.h - matr.c / 2),
    z,
});

const normalizeToDevice = ({ x = 0, y = 0, z = 0 }) => ({
    x: (x / display.innerWidth) * 2 - 1,
    y: -(y / display.innerHeight) * 2 + 1,
    z,
});


const camera = new PerspectiveCamera(75, display.innerWidth / display.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);
const renderer = new WebGLRenderer();
document.body.appendChild(renderer.domElement);

const scenes = new BehaviorSubject(null);
const intersections = fromEvent(document, 'click')
    .pipe(mergeMap(click => scenes.pipe(first())
        .pipe(map(scene => [scene, click]))))
    .pipe(map(([scene, click]) => {
        console.log(scene, click);
        const coords = normalizeToDevice({
            x: click.clientX,
            y: click.clientY,
        });
        const mouse = new Vector2(coords.x, coords.y);
        const raycaster = new Raycaster();
        raycaster.setFromCamera(mouse, camera);
        console.log(raycaster.intersectObjects(scene.children));
        return raycaster.intersectObjects(scene.children);
    }));

const snap = fromJS(matrixMap(matrixCreate(matr.r, matr.c), () => 0));
console.log(snap.toJSON());

const snapshots = intersections
    .pipe(filter(intersections => intersections.length))
    .pipe(map(([{ object: { position } }]) => worldToMatrix(position)))
    .pipe(scan((snap, coords) => fromJS(matrixMap(snap.toJSON(), (c, x, y) => ((x === coords.x && y === coords.y) ? Math.abs(c - 1) : c))), snap));
const skins = snapshots
    .pipe(startWith(snap))
    .pipe(map(snap => matrixToList(matrixMap(snap.toJSON(), (c, x, y) => {
        const box = new Mesh(new BoxGeometry(5, 5, 1), new MeshBasicMaterial({
            color: c ? 0x00ff00 : 0xff0000,
            wireframe: !c,
        }));
        const position = matrixToWorld({
            x,
            y,
        });
        box.position.set(position.x, position.y, position.z);
        return box;
    }))));
combineLatest(skins, timer(0, 1000), fromEvent(display, 'resize')
    .pipe(startWith({})))
    .pipe(auditTime(1000 / 120))
    .pipe(timeInterval())
    .subscribe(({
        value: [skins, frameCount],
        interval,
    }) => {
        console.log(`fps: ${Math.floor(1000 / interval)}, frameCount: ${frameCount}`);
        const scene = new Scene();
        skins.forEach(skin => scene.add(skin));
        renderer.setSize(display.innerWidth, display.innerHeight);
        renderer.render(scene, camera);
        scenes.next(scene);
    });

/*

const snap = fromJS([
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
]);
const click = fromEvent(document, 'click');
const snapshots = click
    .pipe(scan(snap => fromJS(nextSnapshot(snap.toJSON())), snap));
const skins = snapshots
    .pipe(startWith(snap))
    .pipe(map(snap => matrixToList(matrixMap(snap.toJSON(), (c, x, y) => {
        const box = new Mesh(new BoxGeometry(5, 5, 5), new MeshBasicMaterial({ color: c ? 0x00ff00 : 0xff0000 }));
        const position = matrixToWorld({
            x,
            y,
        });
        box.position.set(position.x, position.y, position.z);
        return box;
    }))));
combineLatest(skins, timer(0, 1000 / 60))
    .pipe(auditTime(1000 / 120))
    .pipe(timeInterval())
    .subscribe(({
                    value: [skins, frameCount],
                    interval,
                }) => {
        // console.log(`fps: ${Math.floor(1000 / interval)}, frameCount: ${frameCount}`);
        const scene = new Scene();
        skins.forEach(skin => scene.add(skin));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);
    });
*/
