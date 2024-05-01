import '@/styles/globals.css'
import StoreProvider from '@/app/StoreProvider'
//TODO - pass in from hello api endpoint? How should that work - initial server endpoint and subseqent client side fetch?

const cars = [
    {
        id: 1,
        slug: 'polestar-2',
        name: 'Polestar 2',
        image: 'polestar2.webp',
    },
    {
        id: 2,
        slug: 'tesla-model-y',
        name: 'Tesla Model Y',
        image: 'modely.webp',
    },
]
const rates = [
    {
        carId: 1,
        mileage: 5000,
        term: 24,
        rental: 503,
    },
    {
        carId: 2,
        mileage: 5000,
        term: 24,
        rental: 521,
    },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta
                    name="viewport"
                    content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
                />
                <meta name="description" content="Description" />
                <meta name="keywords" content="Keywords" />
                <title>Next.js PWA Example</title>

                <link rel="manifest" href="/manifest.json" />
                <link href="/icons/favicon-16x16.png" rel="icon" type="image/png" sizes="16x16" />
                <link href="/icons/favicon-32x32.png" rel="icon" type="image/png" sizes="32x32" />
                <link rel="apple-touch-icon" href="/apple-icon.png"></link>
                <meta name="theme-color" content="#317EFB" />
            </head>
            <body>
                <noscript>You need to enable JavaScript to run this app.</noscript>
                <StoreProvider rates={rates} cars={cars} car={'tesla-model-y'}>
                    <div id="root">{children}</div>
                </StoreProvider>
            </body>
        </html>
    )
}
