import { Context } from '@openland/context';
import { AtomicInteger } from './AtomicInteger';
import { Tuple, Subspace, encoders } from '@openland/foundationdb';
import { EntityStore } from './EntityStore';

export abstract class AtomicIntegerFactory {

    readonly store: EntityStore;
    readonly directory: Subspace;

    protected constructor(store: EntityStore, subspace: Subspace) {
        this.store = store;
        this.directory = subspace;
    }

    protected _findById(key: Tuple[]) {
        return new AtomicInteger(encoders.tuple.pack(key), this.directory);
    }

    protected _get(ctx: Context, key: Tuple[]) {
        return this._findById(key).get(ctx);
    }

    protected _set(ctx: Context, key: Tuple[], value: number) {
        this._findById(key).set(ctx, value);
    }

    protected _add(ctx: Context, key: Tuple[], value: number) {
        this._findById(key).add(ctx, value);
    }

    protected _increment(ctx: Context, key: Tuple[]) {
        this._findById(key).increment(ctx);
    }

    protected _decrement(ctx: Context, key: Tuple[]) {
        this._findById(key).decrement(ctx);
    }
}