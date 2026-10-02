import HeroSection from '@/components/home/hero-section';
import {Button} from '@/components/ui/button'; 
import BgGradient from '@/components/common/bg-gradient';
import DemoSection from '@/components/home/demosection';
import HowItWorks from '@/components/home/how-it-works';

export default function Home() {
  return (
    <div className="relative w-full">
      <BgGradient/>
    <div className="flex flex-col">
      <HeroSection/>
      <DemoSection/>
      <HowItWorks/>
    </div>
    </div>
  );
}  