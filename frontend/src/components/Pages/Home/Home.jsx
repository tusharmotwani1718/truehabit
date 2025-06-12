import React from 'react'
import { Carousel, Footer, PrimaryButton } from '../../index.js'
import { FaArrowRightLong } from "react-icons/fa6";
import { Reveal } from '../../../framer-motion/index.js'
import { TbTargetArrow, TbDeviceAnalytics, TbCloudComputing, TbUsers, TbReport } from 'react-icons/tb';
import { useModal } from '../../../context/index.js';









function Home() {


  const imagesUsed = {
    "dashboard": "https://res.cloudinary.com/dzhfpcjwv/image/upload/v1749708237/truehabit/vtwkxsfvtzbf0jimb2li.webp",
    "dashboard2": "https://res.cloudinary.com/dzhfpcjwv/image/upload/v1749708237/truehabit/cuhipm49umunervqwkmi.webp",
    "habits": "https://res.cloudinary.com/dzhfpcjwv/image/upload/v1749710140/truehabit/bakrwjgvwoyosc6hh4up.webp",
    "habit1": "https://res.cloudinary.com/dzhfpcjwv/image/upload/v1749710140/truehabit/vobn7t6micrb8wnsmluf.webp",
    "habit2": "https://res.cloudinary.com/dzhfpcjwv/image/upload/v1749710140/truehabit/yuaz5r1r46g2x3gulm5d.webp"
  }

  const carouselImages = [
    imagesUsed.habit1,
    imagesUsed.habit2
  ]

  const { openModal } = useModal();


  return (
    <>

      <section className='w-[90%] mx-auto h-auto min-h-[90svh] grid grid-rows-[max-content_max-content] gap-8 content-center md:w-[90%] md:grid md:grid-cols-[.45fr_.55fr] md:grid-rows-[.7fr]'>
        <div className='flex flex-col justify-center gap-4 md:items-center md:justify-center'>

          <h2 className="flex flex-col text-custom-xl md:text-custom-xxl md:w-[65%]">
            <Reveal>
              <span className='bg-gradient-to-r from-[#673AB7] via-[#8C6CC5] to-[#5117B8] bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-[#BB86FC] dark:via-[#D1BCEA] dark:to-[#AD6BFF]'>Track Your Progress,</span>
            </Reveal>
            <Reveal>
              <span>Transform Your Life</span>
            </Reveal>
          </h2>


          <div className='flex flex-col gap-4 md:w-[65%] md:gap-6'>
            <Reveal>
              <span>
                Master your journey to success with trueHabit—track your daily habits, stay consistent, and build better routines. Small actions lead to big results, and we're here to help you every step of the way.
              </span>
            </Reveal>
            <Reveal>
              <PrimaryButton text='Get Started Now' classes='text-sm py-[3px] px-4 cursor-pointer' borderRadius={"2xl"} onClick={() => openModal("authModalSignup")} />
            </Reveal>
          </div>


        </div>
        <Reveal slideAnimation={false}>
          <div>
            <img src={imagesUsed["dashboard"]} alt="Habits Dashboard" className='h-full' />
          </div>
        </Reveal>
      </section>


      <section className='w-[90%] mx-auto h-auto min-h-[90svh] grid grid-rows-[max-content_max-content_max-content] gap-8 mt-12 md:w-[90%] md:my-7 md:grid-rows-[max-content_max-content] md:grid-cols-[auto_auto] md:justify-items-center md:gap-15'>
        <div className='flex flex-col items-center gap-5 md:col-span-2'>
          <div className='flex flex-col gap-3 text-center items-center'>
            <Reveal>
              <span className='text-custom-lg font-bold text-primary dark:text-dark-primary md:text-custom-xl'>Habit Tracking, Reimagined: Data-Driven Progress.
              </span>
            </Reveal>
            <Reveal>
              <span className='w-[90%] opacity-70 text-sm md:text-custom-md'>Track, analyze, and conquer your goals — all in one place.</span>
            </Reveal>
          </div>
          <Reveal>
            <PrimaryButton text='Start Tracking Now' classes='mx-auto cursor-pointer' icon={<FaArrowRightLong />} onClick={() => openModal("authModalSignup")} />
          </Reveal>
        </div>

        <div className='p-4 rounded-md bg-primary/40 dark:bg-dark-primary/40 md:w-[100%]'>
          <Reveal slideAnimation={false} >
            <div>
              <img src={imagesUsed["dashboard"]} alt="Habits Dashboard" />
            </div>
          </Reveal>
        </div>

        <div className='p-4 rounded-md bg-primary/40 dark:bg-dark-primary/40 md:w-[100%]'>
          <Reveal slideAnimation={false}>
            <div>
              <img src={imagesUsed["dashboard2"]} alt="Habits Dashboard" />
            </div>
          </Reveal>
        </div>


      </section>

      <section className='w-[90%] mx-auto h-auto grid grid-rows-[max-content_max-content] gap-8 py-10 mt-4 md:w-[90%] md:*:justify-items-center'>
        <div className='flex flex-col gap-5 items-center'>
          <div className='flex flex-col gap-3 text-center items-center'>
            <Reveal>
              <span className='text-custom-lg font-bold text-primary dark:text-dark-primary md:text-custom-xl'>Have Full Control Over Your Habits.</span>
            </Reveal>
            <Reveal>
              <span className='w-[90%] opacity-70 text-sm md:text-custom-md'>Schedules, Statistics, Calendar, Notes and much more... All with a single click.</span>
            </Reveal>
          </div>
          <Reveal>
            <PrimaryButton text='Start Tracking Now' classes='mx-auto cursor-pointer' icon={<FaArrowRightLong />} onClick={() => openModal("authModalSignup")} />
          </Reveal>
        </div>
        <div className='p-4 rounded-md bg-primary/40 dark:bg-dark-primary/40 md:w-[80%] md:mx-auto'>
          <Reveal slideAnimation={false}>
            <div className='h-full'> {/* Ensure this div takes full height of its parent */}
              <img
                src={imagesUsed["habits"]}
                alt="Habits Management Image"
                className='h-full w-full object-cover' // Make the image take full height and width
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 px-4 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-custom-lg font-bold text-primary dark:text-dark-primary md:text-custom-xl">
              No Ordinary Tracker. Here's Why
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 dark:shadow-gray-950">
              <div className="flex flex-col space-y-4">
                <span className="text-primary dark:text-dark-primary text-4xl">
                  <TbTargetArrow />
                </span>
                <div>
                  <h2 className="text-primary dark:text-dark-primary text-xl font-semibold mb-2">Streaks that Stick</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Keep your momentum going! Track your daily consistency and see your streak grow—every day counts towards building habits that last.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 dark:shadow-gray-950">
              <div className="flex flex-col space-y-4">
                <span className="text-primary dark:text-dark-primary text-4xl">
                  <TbDeviceAnalytics />
                </span>
                <div>
                  <h2 className="text-primary dark:text-dark-primary text-xl font-semibold mb-2">In-Depth Habit Analysis</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Gain a complete view of your progress with detailed analytics. Understand your patterns and make data-driven improvements.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 dark:shadow-gray-950">
              <div className="flex flex-col space-y-4">
                <span className="text-primary dark:text-dark-primary text-4xl">
                  <TbUsers />
                </span>
                <div>
                  <h2 className="text-primary dark:text-dark-primary text-xl font-semibold mb-2">Team Habit Challenges</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Join forces with friends to build better habits. Compete, collaborate, and grow together on your journey to success.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 dark:shadow-gray-950">
              <div className="flex flex-col space-y-4">
                <span className="text-primary dark:text-dark-primary text-4xl">
                  <TbReport />
                </span>
                <div>
                  <h2 className="text-primary dark:text-dark-primary text-xl font-semibold mb-2">AI-Driven Reports</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Let our AI check your data and offer simple, personal advice. Use this advice to boost your habit performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='w-[90%] mx-auto h-auto grid grid-rows-[max-content_max-content] gap-8 py-5 md:py-10 mt-4 md:w-[90%] md:*:justify-items-center'>
        <div className='flex flex-col gap-5 items-center'>
          <div className='flex flex-col gap-3 text-center items-center'>
            <Reveal>
              <span className='text-custom-lg font-bold text-primary dark:text-dark-primary md:text-custom-xl'>Your tracking analysis can't be more deep.</span>
            </Reveal>
            <Reveal>
              <span className='w-[90%] opacity-70 text-sm md:text-custom-md'>From streaks to stats, we turn daily actions into lifelong results. Start your journey today — no spreadsheets required.</span>
            </Reveal>
          </div>

        </div>

        <Reveal slideAnimation={false}>
          <Carousel images={carouselImages} className='w-[100%] mx-auto md:h-[80svh] md:w-[75%] border-2 border-on-primary dark:border-dark-on-primary' />
        </Reveal>

      </section>


      {/*  */}



      <Footer />
    </>



  )
}

export default Home
