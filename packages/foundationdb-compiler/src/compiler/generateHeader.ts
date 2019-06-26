import { SchemaModel } from '../model';
import { StringBuilder } from './StringBuilder';
import { generateAtomicsHeader } from './generateAtomics';
import { generateEntitiesHeader } from './generateEntities';

export function generateHeader(schema: SchemaModel, builder: StringBuilder) {
    builder.append(`// THIS FILE IS AUTOGENERATED! DO NOT TRY TO EDIT!`);
    builder.append(`// @ts-ignore`);
    builder.append(`import { Context } from '@openland/context';`);
    builder.append(`// @ts-ignore`);
    builder.append(`import { Subspace } from '@openland/foundationdb';`);
    builder.append(`// @ts-ignore`);
    builder.append(`import { EntityStorage, BaseStore, codecs as c } from '@openland/foundationdb-entity';`);
    generateAtomicsHeader(schema, builder);
    generateEntitiesHeader(schema, builder);
}