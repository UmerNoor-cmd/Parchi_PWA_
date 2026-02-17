import Image from "next/image"

// Define the Brand type based on the API response
interface Brand {
    id: string;
    businessName: string;
    logoPath: string | null;
    category: string | null;
    featuredOrder: number | null;
}

interface MerchantShowcaseSectionProps {
    brands?: Brand[];
}

export function MerchantShowcaseSection({ brands = [] }: MerchantShowcaseSectionProps) {
    // API base URL for constructing image paths
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const baseUrl = apiBaseUrl.startsWith('http') ? apiBaseUrl : `http://${apiBaseUrl}`;

    return (
        <section className="w-full py-6 md:py-12 lg:py-16 bg-white">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-heading text-primary">
                            Trusted by Brands
                        </h2>
                        <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                            From your morning coffee to your late-night cravings, Parchi has you covered.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-80">
                    {brands.length > 0 ? (
                        brands.map((brand) => (
                            <div key={brand.id} className="flex items-center justify-center w-32 h-20 relative">
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100 p-2 overflow-hidden">
                                    {brand.logoPath ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={brand.logoPath.startsWith('http') ? brand.logoPath : `${baseUrl}/public/${brand.logoPath}`}
                                                alt={brand.businessName}
                                                fill
                                                className="object-contain"
                                                unoptimized
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-sm font-bold text-gray-400 text-center">{brand.businessName}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        // Fallback message if no brands are found
                        <p className="col-span-full text-muted-foreground">Discover exclusive offers from our partner brands.</p>
                    )}
                </div>
            </div>
        </section>
    )
}
