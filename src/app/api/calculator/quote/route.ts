import { NextResponse } from 'next/server';
import { calculateEstimate, CalculatorError } from '@/domain/calculator/calculate';
import { calculatorInputSchema } from '@/domain/calculator/schemas';
import { getPublishedPriceList } from '@/server/repositories/pricing';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsedInput = calculatorInputSchema.safeParse(json);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: 'Ошибка валидации параметров расчета',
          fieldErrors: parsedInput.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const priceList = await getPublishedPriceList(parsedInput.data.city);
    const quote = calculateEstimate(parsedInput.data, priceList);

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (err: unknown) {
    if (err instanceof CalculatorError) {
      return NextResponse.json(
        {
          code: err.code,
          message: err.message,
        },
        { status: 422 },
      );
    }

    console.error('[API Quote Error]:', err);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Произошла непредвиденная ошибка при расчете сметы',
      },
      { status: 500 },
    );
  }
}
