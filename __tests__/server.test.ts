import * as supertest from 'supertest';
import { start } from '../src/server';


describe('frida backend', () => {
  let request;
  let app;

  beforeAll(async () => {
    app = start();
    request = supertest(app);
  });

  it('get basic information', async () => {
    const ip = '192.168.1.1';
    const remoteDeviceId = `remote@${ip}`;
    await request.put(`/device/${ip}`).expect(200);
    const res2 = await request.get('/device/list').expect(200);
    expect(res2.body).toBeInstanceOf(Array);
    expect(res2.body.find(e => e.id === remoteDeviceId)).toBeInstanceOf(Object);
    await request.delete(`/device/somerandomhost`).expect(404);    
  });

  it('should get apps and processes', async () => {
    const apps = await request.get('/device/usb/apps').expect(200);
    expect(apps.body).toBeInstanceOf(Array);
    console.log(apps.body)
  })

  afterAll(async(done) => {
    app.close();
    done();
  });

});
