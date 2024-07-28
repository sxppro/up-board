import { getCategories } from '@/db';
import { Col, Grid } from '@tremor/react';
import CategoryInsights from './category-insights';

const CategoryInsightsGroup = async () => {
  const categories = await getCategories('parent');

  return (
    <Grid numItemsMd={2} className="gap-4">
      {categories.map(({ id, name }) => (
        <Col key={id}>
          <CategoryInsights category={id} categoryName={name} />
        </Col>
      ))}
    </Grid>
  );
};

export default CategoryInsightsGroup;
