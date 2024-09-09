'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import Container from "../Container"
import CategoryItem from "./CategoryItem"
import { usePathname } from "next/navigation"
import { useGetAllCategoriesQuery } from "@/store/apiSlice"
import CategoryType from "@/types/category"


const CategoryList = () => {

    const pathname = usePathname();

    const [isAtTop, setIsAtTop] = useState(true);


    const { data: categories } = useGetAllCategoriesQuery();

    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        setIsAtTop(scrollPosition < 50);
    };


    useEffect(() => {
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);


    return (
        <div className={`bg-slate-100 mt-4 transform transition-all duration-300 ease-in-out ${isAtTop ? 'translate-y-0 opacity-100' : '-translate-y-full hidden mt-0'}`}>
            <Container>
                <div className="flex items-center gap-10 py-1 text-[0.94rem]">
                    <Link href={'/products'}>
                        <CategoryItem
                            label="همه"
                            selected={pathname === '/products'}
                        />
                    </Link>
                    {categories?.map((category:CategoryType) => (
                        <Link
                            key={category._id}
                            href={`/category/${category._id}`}
                        >
                            <CategoryItem
                                label={category.name}
                                selected={pathname === `/category/${category._id}`}
                            />
                        </Link>
                    ))}
                    <Link href={'/top-sales-products'}>
                        <CategoryItem
                            label="فروش ویژه"
                            selected={pathname === '/top-sales-products'}
                        />
                    </Link>

                    <Link href={'/weblog'}>
                        <CategoryItem
                            label="وبلاگ"
                            selected={pathname === '/weblog'}
                        />
                    </Link>

                    <Link href={'/about-us'}>
                        <CategoryItem
                            label="درباره ما"
                            selected={pathname === '/about-us'}
                        />
                    </Link>
                </div>
            </Container>
        </div>
    )
}

export default CategoryList