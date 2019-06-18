import { Database } from "./Database";
import { inTx } from "./inTx";
import { createNamedContext } from "@openland/context";
import { encoders } from "./encoding";

async function createKeyspaces() {
    let db = await Database.openTest();
    return [
        db.allKeys
            .withKeyEncoding(encoders.tuple)
            .withValueEncoding(encoders.int32LE),
        db.allKeys
            .withKeyEncoding(encoders.tuple)
            .withValueEncoding(encoders.int32LE)
            .subspace(['1']),
        db.allKeys
            .withKeyEncoding(encoders.tuple)
            .withValueEncoding(encoders.int32LE)
            .subspace(['2'])
            .subspace(['3']),
        db.allKeys
            .subspace(Buffer.of(100))
            .withKeyEncoding(encoders.tuple)
            .withValueEncoding(encoders.int32LE),
        db.allKeys
            .subspace(Buffer.of(101))
            .withValueEncoding(encoders.int32LE)
            .withKeyEncoding(encoders.tuple)
    ];
}

describe('Subspace', () => {

    it('should read and write single keys', async () => {
        let keyspaces = await createKeyspaces();
        for (let keyspace of keyspaces) {
            let rootCtx = createNamedContext('test');
            await inTx(rootCtx, async (ctx) => {

                // Read
                let k = await keyspace.get(ctx, ['key']);
                expect(k).toBe(null);

                // Set
                keyspace.set(ctx, ['key'], 1);

                // Read your writes
                k = await keyspace.get(ctx, ['key']);
                expect(k).toBe(1);
            });

            // Read in ephemeral transaction
            let k2 = await keyspace.get(rootCtx, ['key']);
            expect(k2).toBe(1);

            // Read in rw transaction
            await inTx(rootCtx, async (ctx) => {
                let k = await keyspace.get(ctx, ['key']);
                expect(k).toBe(1);
            });
        }
    });

    it('should clear keys', async () => {
        let keyspaces = await createKeyspaces();
        for (let keyspace of keyspaces) {
            let rootCtx = createNamedContext('test');
            await inTx(rootCtx, async (ctx) => {
                keyspace.set(ctx, ['key'], 1);
            });
            let ex = await keyspace.get(rootCtx, ['key']);
            expect(ex).toBe(1);

            await inTx(rootCtx, async (ctx) => {
                keyspace.clear(ctx, ['key']);
            });
            ex = await keyspace.get(rootCtx, ['key']);
            expect(ex).toBe(null);
        }
    });

    it('should add', async () => {
        let keyspaces = await createKeyspaces();
        for (let keyspace of keyspaces) {
            let rootCtx = createNamedContext('test');
            await inTx(rootCtx, async (ctx) => {
                keyspace.set(ctx, ['key', 1], 1);
            });
            let ex = await keyspace.get(rootCtx, ['key', 1]);
            expect(ex).toBe(1);

            await inTx(rootCtx, async (ctx) => {
                keyspace.add(ctx, ['key', 1], 1);
            });

            ex = await keyspace.get(rootCtx, ['key', 1]);
            expect(ex).toBe(2);

            await inTx(rootCtx, async (ctx) => {
                keyspace.add(ctx, ['key', 1], -3);
            });

            ex = await keyspace.get(rootCtx, ['key', 1]);
            expect(ex).toBe(-1);
        }
    });

    it('should perform bitwise or', async () => {
        let keyspaces = await createKeyspaces();
        for (let keyspace of keyspaces) {
            let rootCtx = createNamedContext('test');
            await inTx(rootCtx, async (ctx) => {
                keyspace.set(ctx, ['key', 1], 0xf);
            });
            let ex = await keyspace.get(rootCtx, ['key', 1]);
            expect(ex).toBe(0xf);

            await inTx(rootCtx, async (ctx) => {
                keyspace.bitOr(ctx, ['key', 1], 0xf0);
            });

            ex = await keyspace.get(rootCtx, ['key', 1]);
            expect(ex).toBe(0xff);
        }
    });

    it('should perform bitwise and', async () => {
        let keyspaces = await createKeyspaces();
        for (let keyspace of keyspaces) {
            let rootCtx = createNamedContext('test');
            await inTx(rootCtx, async (ctx) => {
                keyspace.set(ctx, ['key', 1], 0xff);
            });
            let ex = await keyspace.get(rootCtx, ['key', 1]);
            expect(ex).toBe(0xff);

            await inTx(rootCtx, async (ctx) => {
                keyspace.bitAnd(ctx, ['key', 1], 0xf0);
            });

            ex = await keyspace.get(rootCtx, ['key', 1]);
            expect(ex).toBe(0xf0);
        }
    });

    it('should perform bitwise xor', async () => {
        let keyspaces = await createKeyspaces();
        for (let keyspace of keyspaces) {
            let rootCtx = createNamedContext('test');
            await inTx(rootCtx, async (ctx) => {
                keyspace.set(ctx, ['key', 1], 0xff);
            });
            let ex = await keyspace.get(rootCtx, ['key', 1]);
            expect(ex).toBe(0xff);

            await inTx(rootCtx, async (ctx) => {
                keyspace.bitXor(ctx, ['key', 1], 0x0f);
            });

            ex = await keyspace.get(rootCtx, ['key', 1]);
            expect(ex).toBe(0xf0);
        }
    });

    it('should be equal to same subspaces', async () => {
        let db = await Database.openTest();
        let ksa = db.allKeys
            .withValueEncoding(encoders.int32LE)
            .withKeyEncoding(encoders.tuple)
            .subspace(['1', '3']);
        let ksb = db.allKeys
            .withKeyEncoding(encoders.tuple)
            .subspace(['1'])
            .withValueEncoding(encoders.int32LE)
            .subspace(['3']);
        let rootCtx = createNamedContext('test');
        await inTx(rootCtx, async (ctx) => {
            ksa.set(ctx, ['key'], 1);
        });
        let k = await ksb.get(rootCtx, ['key']);
        expect(k).toBe(1);

        // Nothing else
        let all = await db.allKeys.range(rootCtx, Buffer.of());
        expect(all.length).toBe(1);
        let all2 = await ksa.range(rootCtx, []);
        expect(all2.length).toBe(1);
        let all3 = await ksb.range(rootCtx, []);
        expect(all3.length).toBe(1);
    });

    it('should read all on allKeys must work', async () => {
        let db = await Database.openTest();
        let rootCtx = createNamedContext('test');

        let keyspaces = [
            db.allKeys
                .withKeyEncoding(encoders.tuple)
                .withValueEncoding(encoders.int32LE),
            db.allKeys
                .withKeyEncoding(encoders.tuple)
                .withValueEncoding(encoders.int32LE)
                .subspace(['1'])
        ];
        for (let keyspace of keyspaces) {
            await db.rawDB.clearRangeStartsWith('');

            await inTx(rootCtx, async (ctx) => {
                keyspace.set(ctx, ['key'], 1);
            });

            let all = await keyspace.range(rootCtx, []);
            expect(all.length).toBe(1);
            all = await keyspace.range(rootCtx, [], { reverse: true });
            expect(all.length).toBe(1);
            all = await keyspace.range(rootCtx, [], { after: ['aaa'] });
            expect(all.length).toBe(1);
            all = await keyspace.range(rootCtx, [], { reverse: true, after: ['aaa'] });
            expect(all.length).toBe(0);
            all = await keyspace.range(rootCtx, [], { reverse: true, after: ['mmm'] });
            expect(all.length).toBe(1);
            all = await keyspace.range(rootCtx, [], { reverse: false, after: ['mmm'] });
            expect(all.length).toBe(0);

            await inTx(rootCtx, async (ctx) => {
                keyspace.set(ctx, ['key2'], 1);
            });

            all = await keyspace.range(rootCtx, [], { limit: 1 });
            expect(all.length).toBe(1);
            all = await keyspace.range(rootCtx, [], { reverse: true, limit: 1 });
            expect(all.length).toBe(1);
            all = await keyspace.range(rootCtx, [], { after: ['aaa'], limit: 1 });
            expect(all.length).toBe(1);
            all = await keyspace.range(rootCtx, [], { reverse: true, after: ['aaa'], limit: 1 });
            expect(all.length).toBe(0);
            all = await keyspace.range(rootCtx, [], { reverse: true, after: ['mmm'], limit: 1 });
            expect(all.length).toBe(1);
            all = await keyspace.range(rootCtx, [], { reverse: false, after: ['mmm'], limit: 1 });
            expect(all.length).toBe(0);
        }
    });

    it('should honor after for exact position', async () => {
        let db = await Database.openTest();
        let rootCtx = createNamedContext('test');

        let keyspaces = [
            db.allKeys
                .withKeyEncoding(encoders.tuple)
                .withValueEncoding(encoders.int32LE),
            db.allKeys
                .withKeyEncoding(encoders.tuple)
                .withValueEncoding(encoders.int32LE)
                .subspace(['1'])
        ];

        for (let keyspace of keyspaces) {
            await inTx(rootCtx, async (ctx) => {
                keyspace.set(ctx, [1, 1], 1);
                keyspace.set(ctx, [1, 2], 2);
                keyspace.set(ctx, [1, 3], 3);
                keyspace.set(ctx, [1, 4], 4);
                keyspace.set(ctx, [1, 5], 5);
                keyspace.set(ctx, [1, 6], 6);
                keyspace.set(ctx, [1, 7], 7);
                keyspace.set(ctx, [1, 8], 8);
                keyspace.set(ctx, [1, 9], 9);
                keyspace.set(ctx, [1, 10], 10);
                keyspace.set(ctx, [1, 11], 11);
                keyspace.set(ctx, [1, 12], 12);
            });

            let res = await keyspace.range(rootCtx, [1], { after: [1, 6], limit: 1 });
            expect(res.length).toBe(1);
            expect(res[0].value).toBe(7);

            res = await keyspace.range(rootCtx, [1], { after: [1, 6], limit: 1, reverse: true });
            expect(res.length).toBe(1);
            expect(res[0].value).toBe(5);

            res = await keyspace.range(rootCtx, [1], { after: [2], limit: 1 });
            expect(res.length).toBe(0);

            res = await keyspace.range(rootCtx, [1], { after: [0], limit: 1, reverse: true });
            expect(res.length).toBe(0);
        }
    });

    it('should honor after for prefix position', async () => {
        let db = await Database.openTest();
        let rootCtx = createNamedContext('test');

        let keyspaces = [
            db.allKeys
                .withKeyEncoding(encoders.tuple)
                .withValueEncoding(encoders.int32LE),
            db.allKeys
                .withKeyEncoding(encoders.tuple)
                .withValueEncoding(encoders.int32LE)
                .subspace(['1'])
        ];

        for (let keyspace of keyspaces) {
            await inTx(rootCtx, async (ctx) => {
                keyspace.set(ctx, [1, 1, 1], 1);
                keyspace.set(ctx, [1, 2, 1], 2);
                keyspace.set(ctx, [1, 3, 1], 3);
                keyspace.set(ctx, [1, 4, 1], 4);
                keyspace.set(ctx, [1, 5, 1], 5);
                keyspace.set(ctx, [1, 6, 0], 6);
                keyspace.set(ctx, [1, 6, 1], 6);
                keyspace.set(ctx, [1, 6, 2], 6);
                keyspace.set(ctx, [1, 7, 1], 7);
                keyspace.set(ctx, [1, 8, 1], 8);
                keyspace.set(ctx, [1, 9, 1], 9);
                keyspace.set(ctx, [1, 10, 1], 10);
                keyspace.set(ctx, [1, 11, 1], 11);
                keyspace.set(ctx, [1, 12, 1], 12);
            });

            let res = await keyspace.range(rootCtx, [1], { after: [1, 6], limit: 1 });
            expect(res.length).toBe(1);
            expect(res[0].value).toBe(7);

            res = await keyspace.range(rootCtx, [1], { after: [1, 6], limit: 1, reverse: true });
            expect(res.length).toBe(1);
            expect(res[0].value).toBe(5);

            res = await keyspace.range(rootCtx, [1], { after: [2], limit: 1 });
            expect(res.length).toBe(0);

            res = await keyspace.range(rootCtx, [1], { after: [0], limit: 1, reverse: true });
            expect(res.length).toBe(0);
        }
    });
});