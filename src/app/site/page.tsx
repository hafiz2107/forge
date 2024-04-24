import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { pricingCards } from '@/lib/constants';
import clsx from 'clsx';
import { Dot } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <section className="h-full w-full relative flex items-center justify-center flex-col">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="bg-gradient-to-t from-primary to-secondary-foreground text-transparent bg-clip-text relative">
          <h1 className="text-9xl font-bold text-center sm:md:text-[200px] md:text-[300px]">
            Forge
          </h1>
        </div>
        <div className="flex justify-center items-center relative md:mt-[-60px]">
          <Image
            src="/assets/preview.png"
            alt="Preview image"
            height={1100}
            width={1100}
            className="rounded-tl-2xl rounded-tr-xl border-2 border-muted"
          />
          <div className="bottom-0 top-[50%] bg-gradient-to-t  dark:from-background left-0 right-0 absolute z-10"></div>
        </div>
      </section>
      <section className="flex justify-center items-center flex-col gap-4">
        <h2 className="text-4xl text-center">Choose what fits you right</h2>
        <p className="text-muted-foreground text-center ">
          Our straightforward pricing plans are tailored to meet your needs. If{' '}
          {"you're"} not <br />
          ready to commit you can get started for free.
        </p>
        <div className="flex justify-center gap-4 flex-wrap mt-6">
          {pricingCards.map((price) => (
            //WIP: Wire up free prod from stripe
            <Card
              key={price.title}
              className={clsx('w-[300px] flex flex-col justify-between', {
                'boder-2 border-primary': price.title === 'Unlimited Saas',
              })}
            >
              <CardHeader>
                <CardTitle
                  className={clsx('', {
                    'text-muted-foreground': price.title !== 'Unlimited Saas',
                  })}
                >
                  {price.title}
                </CardTitle>
                <CardDescription>{price.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-4xl font-bold">{price.price}</span>
                {price.title !== 'Starter' && <span className="">/month</span>}
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                <div className="flex flex-col gap-2">
                  {price.features.map((feature) => (
                    <div className="flex gap- items-center" key={feature}>
                      <Dot className="text-muted-foreground" />
                      <p>{feature}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/agency?plan=${price.priceId}`}
                  className={clsx(
                    'w-full text-center bg-primary p-2 rounded-md',
                    {
                      '!bg-muted-foreground': price.title !== 'Unlimited Saas',
                    }
                  )}
                >
                  Get started
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
