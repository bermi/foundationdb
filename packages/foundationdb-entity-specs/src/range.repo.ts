// THIS FILE IS AUTOGENERATED! DO NOT TRY TO EDIT!
// @ts-ignore
import { Context } from '@openland/context';
// @ts-ignore
import { Subspace, Watch } from '@openland/foundationdb';
// @ts-ignore
import { EntityStorage, BaseStore, RangeQueryOptions, codecs as c } from '@openland/foundationdb-entity';
// @ts-ignore
import { Entity, EntityFactory, EntityDescriptor, SecondaryIndexDescriptor, ShapeWithMetadata, PrimaryKeyDescriptor, FieldDescriptor, StreamProps } from '@openland/foundationdb-entity';

export interface RangeIndexShape {
    id: number;
    range1: number;
    range2: number;
}

export interface RangeIndexCreateShape {
    range1: number;
    range2: number;
}

export class RangeIndex extends Entity<RangeIndexShape> {
    get id(): number { return this._rawValue.id; }
    get range1(): number { return this._rawValue.range1; }
    set range1(value: number) {
        let normalized = this.descriptor.codec.fields.range1.normalize(value);
        if (this._rawValue.range1 !== normalized) {
            this._rawValue.range1 = normalized;
            this._updatedValues.range1 = normalized;
            this.invalidate();
        }
    }
    get range2(): number { return this._rawValue.range2; }
    set range2(value: number) {
        let normalized = this.descriptor.codec.fields.range2.normalize(value);
        if (this._rawValue.range2 !== normalized) {
            this._rawValue.range2 = normalized;
            this._updatedValues.range2 = normalized;
            this.invalidate();
        }
    }
}

export class RangeIndexFactory extends EntityFactory<RangeIndexShape, RangeIndex> {

    static async open(storage: EntityStorage) {
        let subspace = await storage.resolveEntityDirectory('rangeIndex');
        let secondaryIndexes: SecondaryIndexDescriptor[] = [];
        secondaryIndexes.push({ name: 'ranges', storageKey: 'ranges', type: { type: 'range', fields: [{ name: 'range1', type: 'integer' }, { name: 'range2', type: 'integer' }] }, subspace: await storage.resolveEntityIndexDirectory('rangeIndex', 'ranges'), condition: undefined });
        let primaryKeys: PrimaryKeyDescriptor[] = [];
        primaryKeys.push({ name: 'id', type: 'integer' });
        let fields: FieldDescriptor[] = [];
        fields.push({ name: 'range1', type: { type: 'integer' }, secure: false });
        fields.push({ name: 'range2', type: { type: 'integer' }, secure: false });
        let codec = c.struct({
            id: c.integer,
            range1: c.integer,
            range2: c.integer,
        });
        let descriptor: EntityDescriptor<RangeIndexShape> = {
            name: 'RangeIndex',
            storageKey: 'rangeIndex',
            subspace, codec, secondaryIndexes, storage, primaryKeys, fields
        };
        return new RangeIndexFactory(descriptor);
    }

    private constructor(descriptor: EntityDescriptor<RangeIndexShape>) {
        super(descriptor);
    }

    readonly ranges = Object.freeze({
        findAll: async (ctx: Context, range1: number) => {
            return (await this._query(ctx, this.descriptor.secondaryIndexes[0], [range1])).items;
        },
        query: (ctx: Context, range1: number, opts?: RangeQueryOptions<number>) => {
            return this._query(ctx, this.descriptor.secondaryIndexes[0], [range1], { limit: opts && opts.limit, reverse: opts && opts.reverse, after: opts && opts.after ? [opts.after] : undefined, afterCursor: opts && opts.afterCursor ? opts.afterCursor : undefined });
        },
        stream: (range1: number, opts?: StreamProps) => {
            return this._createStream(this.descriptor.secondaryIndexes[0], [range1], opts);
        },
        liveStream: (ctx: Context, range1: number, opts?: StreamProps) => {
            return this._createLiveStream(ctx, this.descriptor.secondaryIndexes[0], [range1], opts);
        },
    });

    create(ctx: Context, id: number, src: RangeIndexCreateShape): Promise<RangeIndex> {
        return this._create(ctx, [id], this.descriptor.codec.normalize({ id, ...src }));
    }

    create_UNSAFE(ctx: Context, id: number, src: RangeIndexCreateShape): RangeIndex {
        return this._create_UNSAFE(ctx, [id], this.descriptor.codec.normalize({ id, ...src }));
    }

    findById(ctx: Context, id: number): Promise<RangeIndex | null> {
        return this._findById(ctx, [id]);
    }

    watch(ctx: Context, id: number): Watch {
        return this._watch(ctx, [id]);
    }

    protected _createEntityInstance(ctx: Context, value: ShapeWithMetadata<RangeIndexShape>): RangeIndex {
        return new RangeIndex([value.id], value, this.descriptor, this._flush, ctx);
    }
}

export interface RangeIndexConditionalShape {
    id: number;
    range1: number;
    range2: number;
}

export interface RangeIndexConditionalCreateShape {
    range1: number;
    range2: number;
}

export class RangeIndexConditional extends Entity<RangeIndexConditionalShape> {
    get id(): number { return this._rawValue.id; }
    get range1(): number { return this._rawValue.range1; }
    set range1(value: number) {
        let normalized = this.descriptor.codec.fields.range1.normalize(value);
        if (this._rawValue.range1 !== normalized) {
            this._rawValue.range1 = normalized;
            this._updatedValues.range1 = normalized;
            this.invalidate();
        }
    }
    get range2(): number { return this._rawValue.range2; }
    set range2(value: number) {
        let normalized = this.descriptor.codec.fields.range2.normalize(value);
        if (this._rawValue.range2 !== normalized) {
            this._rawValue.range2 = normalized;
            this._updatedValues.range2 = normalized;
            this.invalidate();
        }
    }
}

export class RangeIndexConditionalFactory extends EntityFactory<RangeIndexConditionalShape, RangeIndexConditional> {

    static async open(storage: EntityStorage) {
        let subspace = await storage.resolveEntityDirectory('rangeIndexConditional');
        let secondaryIndexes: SecondaryIndexDescriptor[] = [];
        secondaryIndexes.push({ name: 'ranges', storageKey: 'ranges', type: { type: 'range', fields: [{ name: 'range1', type: 'integer' }, { name: 'range2', type: 'integer' }] }, subspace: await storage.resolveEntityIndexDirectory('rangeIndexConditional', 'ranges'), condition: (src) => src.range1 === 0 });
        let primaryKeys: PrimaryKeyDescriptor[] = [];
        primaryKeys.push({ name: 'id', type: 'integer' });
        let fields: FieldDescriptor[] = [];
        fields.push({ name: 'range1', type: { type: 'integer' }, secure: false });
        fields.push({ name: 'range2', type: { type: 'integer' }, secure: false });
        let codec = c.struct({
            id: c.integer,
            range1: c.integer,
            range2: c.integer,
        });
        let descriptor: EntityDescriptor<RangeIndexConditionalShape> = {
            name: 'RangeIndexConditional',
            storageKey: 'rangeIndexConditional',
            subspace, codec, secondaryIndexes, storage, primaryKeys, fields
        };
        return new RangeIndexConditionalFactory(descriptor);
    }

    private constructor(descriptor: EntityDescriptor<RangeIndexConditionalShape>) {
        super(descriptor);
    }

    readonly ranges = Object.freeze({
        findAll: async (ctx: Context, range1: number) => {
            return (await this._query(ctx, this.descriptor.secondaryIndexes[0], [range1])).items;
        },
        query: (ctx: Context, range1: number, opts?: RangeQueryOptions<number>) => {
            return this._query(ctx, this.descriptor.secondaryIndexes[0], [range1], { limit: opts && opts.limit, reverse: opts && opts.reverse, after: opts && opts.after ? [opts.after] : undefined, afterCursor: opts && opts.afterCursor ? opts.afterCursor : undefined });
        },
        stream: (range1: number, opts?: StreamProps) => {
            return this._createStream(this.descriptor.secondaryIndexes[0], [range1], opts);
        },
        liveStream: (ctx: Context, range1: number, opts?: StreamProps) => {
            return this._createLiveStream(ctx, this.descriptor.secondaryIndexes[0], [range1], opts);
        },
    });

    create(ctx: Context, id: number, src: RangeIndexConditionalCreateShape): Promise<RangeIndexConditional> {
        return this._create(ctx, [id], this.descriptor.codec.normalize({ id, ...src }));
    }

    create_UNSAFE(ctx: Context, id: number, src: RangeIndexConditionalCreateShape): RangeIndexConditional {
        return this._create_UNSAFE(ctx, [id], this.descriptor.codec.normalize({ id, ...src }));
    }

    findById(ctx: Context, id: number): Promise<RangeIndexConditional | null> {
        return this._findById(ctx, [id]);
    }

    watch(ctx: Context, id: number): Watch {
        return this._watch(ctx, [id]);
    }

    protected _createEntityInstance(ctx: Context, value: ShapeWithMetadata<RangeIndexConditionalShape>): RangeIndexConditional {
        return new RangeIndexConditional([value.id], value, this.descriptor, this._flush, ctx);
    }
}

export interface Store extends BaseStore {
    readonly RangeIndex: RangeIndexFactory;
    readonly RangeIndexConditional: RangeIndexConditionalFactory;
}

export async function openStore(storage: EntityStorage): Promise<Store> {
    let RangeIndexPromise = RangeIndexFactory.open(storage);
    let RangeIndexConditionalPromise = RangeIndexConditionalFactory.open(storage);
    return {
        storage,
        RangeIndex: await RangeIndexPromise,
        RangeIndexConditional: await RangeIndexConditionalPromise,
    };
}
