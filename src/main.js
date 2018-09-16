import console from 'console';
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
} from 'three';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { timer } from 'rxjs/observable/timer';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/timeInterval';
import { fromJS } from 'immutable';
import { toList, map } from './core/matrix';
import { nextSnapshot } from './core/snapshots';


const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);
const renderer = new WebGLRenderer();
document.body.appendChild(renderer.domElement);

const snap = fromJS([
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 1, 1],
    [1, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [0, 0, 1, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0],
]);
const click = fromEvent(document, 'click');
const snapshots = combineLatest(click.startWith(null))
    .scan(snap => fromJS(nextSnapshot(snap.toJSON())), snap);
const skins = snapshots.map(snap => toList(map(snap.toJSON(), (c, x, y) => {
    const box = new Mesh(new BoxGeometry(5, 5, 5), new MeshBasicMaterial({ color: c ? 0x00ff00 : 0xff0000 }));
    box.position.set(5 * -(x - 6 / 2), 5 * -(y - 6 / 2), 0);
    return box;
})));
combineLatest(skins, timer(0, 1000))
    .throttleTime(1000 / 120)
    .timeInterval()
    .subscribe(({
        value: [skins, frameCount],
        interval,
    }) => {
        console.log(`fps: ${1000 / interval}, frameCount: ${frameCount}`);
        const scene = new Scene();
        skins.forEach(skin => scene.add(skin));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);
    });
