import { primaryKey } from '@openland/foundationdb-compiler';
import { Context } from '@openland/context';
import { Stream } from '../Stream';
import { transactional, TupleItem } from '@openland/foundationdb';
import { tupleToCursor, cursorToTuple } from './utils';
import { SecondaryIndexDescriptor } from '../EntityDescriptor';

export class IndexStream<T> implements Stream<T> {
    private readonly _descriptor: SecondaryIndexDescriptor;
    private readonly _builder: (ctx: Context, src: any) => T;
    private readonly _limit: number;
    private readonly _reverse: boolean;
    private _cursor: TupleItem[] | undefined = undefined;

    constructor(
        descriptor: SecondaryIndexDescriptor,
        limit: number,
        reverse: boolean,
        builder: (ctx: Context, src: any) => T
    ) {
        this._descriptor = descriptor;
        this._builder = builder;
        this._limit = limit;
        this._reverse = reverse;
    }

    @transactional
    async tail(ctx: Context): Promise<string | null> {
        let res = await this._descriptor.subspace.range(ctx, [], { limit: 1, reverse: !this._reverse });
        if (res.length >= 1) {
            return tupleToCursor(res[0].key);
        } else {
            return null;
        }
    }

    @transactional
    async head(ctx: Context): Promise<string | null> {
        let res = await this._descriptor.subspace.range(ctx, [], { limit: 1, reverse: this._reverse });
        if (res.length >= 1) {
            return tupleToCursor(res[0].key);
        } else {
            return null;
        }
    }

    seek(cursor: string) {
        this._cursor = cursorToTuple(cursor);
    }

    reset() {
        this._cursor = undefined;
    }

    @transactional
    async next(ctx: Context): Promise<T[]> {
        let res = await this._descriptor.subspace.range(ctx, [], { limit: this._limit, after: this._cursor, reverse: this._reverse });
        if (res.length > 0) {
            let r = res.map((v) => this._builder(ctx, v.value));
            this._cursor = res[res.length - 1].key; // NOTE: Update cursor only after successful decoding
            return r;
        } else {
            return [];
        }
    }
}