'use client'

import { getAllProducts } from "@/libs/apiUrls";
import { useContext, useEffect, useRef, useState } from "react";
import Heading from "./Heading";
import ProductType from "@/types/product";

// ** Swiper
import { Swiper, SwiperSlide } from "swiper/react"
import { Swiper as SwiperType } from 'swiper';
import 'swiper/css'
import 'swiper/css/pagination'

import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import ProductBox from "./products/ProductBox";
import { AuthContext } from "@/context/AuthContext";
import NullData from "./NullData";


const TopProducts = () => {

    const swiperRef = useRef<SwiperType>();

    const [products, setProducts] = useState<ProductType[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const allProducts = await getAllProducts();
            if (allProducts) {
                // Shuffle and select 10 random products
                const shuffledProducts = allProducts.sort(() => 0.5 - Math.random());
                setProducts(shuffledProducts.slice(0, 6));
            }
        };

        fetchProducts();
    }, []);


    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error("AuthContext must be used within an AuthProvider");
    }

    const { user } = authContext;


    if (!products || products.length === 0) {
        return (
            <NullData title="محصول پرفروشی وجود ندارد" center="h-full mt-20 !text-[1.3rem]" />
        );
    };


    return (
        <div className="mt-20">
            <div className="flex items-center justify-start">
                <Heading title="پرفروش ترین محصولات" />
            </div>

            <div className="relative ___swiper-container mt-10" dir="ltr">
                <Swiper
                    loop={products.length > 4}
                    slidesPerView={Math.min(4, products.length)}

                    spaceBetween={30}
                    onBeforeInit={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    breakpoints={{
                        300: {
                            slidesPerView: 2
                        },
                        600: {
                            slidesPerView: 3
                        },
                        800: {
                            slidesPerView: 4
                        },
                    }}
                    className="w-full mySwiper"
                >
                    {products.map((product) => (
                        <SwiperSlide key={product._id}>
                            <ProductBox product={product} user={user} />
                        </SwiperSlide>
                    ))}
                </Swiper>


                <div
                    className="flex items-center justify-center gap-5 ___swiper-buttons m:hidden"
                >
                    <button
                        onClick={() => swiperRef.current?.slidePrev()}
                        className="bg-white rounded-full text-xl w-[3.2rem] h-[3.2rem] sl:w-[2.5rem] sl:h-[2.5rem] flex items-center justify-center shadow-[0px_0px_3px_1px_rgba(165,165,165,0.75)] absolute -left-8 sl:-left-2 top-0 translate-y-[270%] sl:translate-y-[340%] z-20"
                    >
                        <IoIosArrowBack size={32} className="relative right-[1px]" />
                    </button>

                    <button
                        onClick={() => swiperRef.current?.slideNext()}
                        className="bg-white rounded-full text-xl w-[3.2rem] h-[3.2rem] sl:w-[2.5rem] sl:h-[2.5rem] flex items-center justify-center shadow-[0px_0px_3px_1px_rgba(165,165,165,0.75)] absolute -right-8 sl:-right-2 top-0 translate-y-[270%] sl:translate-y-[340%] z-20"
                    >
                        <IoIosArrowForward size={32} className="relative left-[1px]" />
                    </button>
                </div>
            </div>
        </div >
    )
}

export default TopProducts