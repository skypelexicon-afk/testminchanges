'use client';
import React , {useState} from 'react';
import AllCourses from '@/app/all-courses/allCourses';
import CouponPopup from '@/components/LandingComponents/CouponPopup';
import Crackers from '@/components/LandingComponents/Crackers'

export default function AllCoursesPage() {
    
    return (
        <>
       

         <div className="relative overflow-hidden">
       
            <AllCourses />

            {/* Offer Popup.. 
            <CouponPopup
                imageSrc="/images/puja sp.png"
                title="Puja Special Offer!"
                description="Apply coupon code 'FESTIVE10' to avail flat 10% off on all courses!"
            />
            */}

 

            </div>
           
        </>
    );
}
