declare module 'cachegoose' {
    import { DocumentQuery, Document, Mongoose } from 'mongoose'

    function cachegoose(mongoose: Mongoose, cacheOptions?: cachegoose.Types.IOptions): void

    namespace cachegoose {
        namespace Types {
            interface IOptions {
                engine?: string
                port?: number
                host?: string
            }
        }

        function clearCache(customKey: string, cb?: () => void): void
    }

    export = cachegoose
}

declare module 'mongoose' {
    interface DocumentQuery<T, DocType extends Document, QueryHelpers = Record<never, never>> {
        cache(ttl?: number, customKey?: string): this
    }
    /*interface Aggregate<T> {
        cache(ttl?: number, customKey?: string): this
    }*/
}