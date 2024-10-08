import React from "react";
import { BsFillPencilFill } from 'react-icons/bs';
import { BiHelpCircle } from 'react-icons/bi';
import { Link } from "react-router-dom";
import User from "../User/User";
import Button from "./ui/Button";
import { useAuthContext } from "../context/AuthContext";
import CartStatus from "./CartStatus";
import { FcGoogle } from 'react-icons/fc';
import { RiHandCoinLine } from 'react-icons/ri';
import Search from "./Search";

export default function Navbar() {

    const {
        login, 
        user, 
        logout, 
    } = useAuthContext();

    return (
        <header className="flex justify-between border-b border-gray-300 p-2">
            <Link 
                to='/'
                className="flex items-center text-4xl text-brand"
            >
                <RiHandCoinLine />
                <h1>HAND2HAND</h1>
            </Link>
            
            {/* 상품 검색 컴포넌트 */}
            <Search />

            <nav className="flex items-center gap-4 font-semibold">
                { user && (
                    <Link to='/carts'>
                        <CartStatus />
                    </Link>
                )}
                { user && (
                    <Link 
                        to='/products/new'
                        className="text-2xl"
                    >
                        <BsFillPencilFill />
                    </Link>
                )}
                { user && (
                    <User user={ user } />
                )}
                {!user && <FcGoogle className="text-4xl cursor-pointer" onClick={login} />}
                { user  && <Button text={ 'Logout' } onClick={ logout }  />}
            </nav>
        </header>
    )
}
