import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Globe, Languages, MapPin, Tag } from 'lucide-react';
import { toast } from 'sonner';
import YouTubeAPIService from '@/services/youtubeAPI';
import { YouTubeLanguage, YouTubeRegion, YouTubeGuideCategory } from '@/types/youtube';

interface LocalizationDataProps {
  apiKey: string;
}

const LocalizationData = ({ apiKey }: LocalizationDataProps) => {
  const [languages, setLanguages] = useState<YouTubeLanguage[]>([]);
  const [regions, setRegions] = useState<YouTubeRegion[]>([]);
  const [guideCategories, setGuideCategories] = useState<YouTubeGuideCategory[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('US');

  const youtubeAPI = new YouTubeAPIService(apiKey);

  const fetchLanguages = async () => {
    try {
      setLoadingLanguages(true);
      const languagesData = await youtubeAPI.getLanguages();
      setLanguages(languagesData);
    } catch (error) {
      console.error('Error fetching languages:', error);
      toast.error('Failed to load supported languages');
    } finally {
      setLoadingLanguages(false);
    }
  };

  const fetchRegions = async () => {
    try {
      setLoadingRegions(true);
      const regionsData = await youtubeAPI.getRegions();
      setRegions(regionsData);
    } catch (error) {
      console.error('Error fetching regions:', error);
      toast.error('Failed to load supported regions');
    } finally {
      setLoadingRegions(false);
    }
  };

  const fetchGuideCategories = async (regionCode: string = 'US') => {
    try {
      setLoadingCategories(true);
      const categoriesData = await youtubeAPI.getGuideCategories(regionCode);
      setGuideCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching guide categories:', error);
      toast.error('Failed to load guide categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="languages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="languages" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Supported Languages</h3>
              <Button
                onClick={fetchLanguages}
                disabled={loadingLanguages}
                variant="outline"
                size="sm"
              >
                {loadingLanguages ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Languages className="mr-2 h-4 w-4" />
                    Load Languages
                  </>
                )}
              </Button>
            </div>

            {languages.length === 0 ? (
              <div className="text-center py-8">
                <Languages className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No languages loaded</p>
                <p className="text-sm text-muted-foreground">
                  Click "Load Languages" to fetch supported languages
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {languages.map((language) => (
                  <Card key={language.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Languages className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{language.snippet.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Code: {language.snippet.hl}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="regions" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Supported Regions</h3>
              <Button
                onClick={fetchRegions}
                disabled={loadingRegions}
                variant="outline"
                size="sm"
              >
                {loadingRegions ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Load Regions
                  </>
                )}
              </Button>
            </div>

            {regions.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No regions loaded</p>
                <p className="text-sm text-muted-foreground">
                  Click "Load Regions" to fetch supported regions
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {regions.map((region) => (
                  <Card key={region.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{region.snippet.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Code: {region.snippet.gl}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Guide Categories</h3>
              <div className="flex gap-2">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="JP">Japan</option>
                  <option value="IN">India</option>
                </select>
                <Button
                  onClick={() => fetchGuideCategories(selectedRegion)}
                  disabled={loadingCategories}
                  variant="outline"
                  size="sm"
                >
                  {loadingCategories ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Tag className="mr-2 h-4 w-4" />
                      Load Categories
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Globe className="h-4 w-4" />
                <span className="font-medium">Region:</span>
                <Badge variant="secondary">{selectedRegion}</Badge>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Guide categories vary by region. Select a region to see available categories.
              </p>
            </div>

            {guideCategories.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No categories loaded</p>
                <p className="text-sm text-muted-foreground">
                  Select a region and click "Load Categories" to fetch guide categories
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {guideCategories.map((category) => (
                  <Card key={category.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Tag className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{category.snippet.title}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {category.id}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default LocalizationData;



