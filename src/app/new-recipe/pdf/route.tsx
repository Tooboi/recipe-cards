export async function GET(request: Request, { params }: { params: { recipeId: string}}) {
    return Response.json({
        test: params
    })
}