const functions = require('firebase-functions');
const express = require('express');

const app = express();
const router = express.Router();

// @ts-ignore
app.use((req, res, next) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (!forwardedFor) {
        res.status(403).send('Forbidden');
        return;
    }

    const forwardedIps = forwardedFor.split(',');

    // x-forwarded-forは偽装が可能
    // 偽装しない場合、<your-ip>,<load-balancer-ip>の順になる
    // <your-ip>,<load-balancer-ip>と偽装した場合、<your-ip>,<load-balancer-ip>,<your-ip>の順になった
    // LoadBalancerは追記するが、Firebase Functionsは追記しない？
    // <load-balancer-ip>と偽装した場合、<load-balancer-ip>,<your-ip>の順になる
    // なので、最後の要素が<load-balancer-ip>であるかどうかで判定する
    if (forwardedIps.length >= 2 && forwardedIps[forwardedIps.length - 1].trim() === '34.36.148.74') {
        next();
    } else {
        res.status(403).send('Forbidden');
    }
});

// @ts-ignore
router.get('/world', async (req, res, next) => {
    console.log(req.headers);
    res.send({
        message: 'Hello, World!'
    });
});

app.use('/', router);

export const hello = functions
    .region('asia-northeast1')
    .runWith({ memory: '128MB',  timeoutSeconds: 2 })
    .https
    .onRequest(app);