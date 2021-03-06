/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.auraframework.test.css.flavor;

import java.util.HashSet;
import java.util.Set;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavorAssortmentDef;
import org.auraframework.def.FlavorIncludeDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Table;

public class FlavorIncludeDefImplTest extends StyleTestCase {

    public FlavorIncludeDefImplTest(String name) {
        super(name);
    }

    /* util */
    private FlavorIncludeDef source(String flavorIncludeSource) throws QuickFixException {
        String fmt = String.format("<aura:flavors>%s</aura:flavors>", flavorIncludeSource);
        DefDescriptor<FlavorAssortmentDef> parent = addFlavorAssortment(fmt);
        return parent.getDef().getFlavorIncludeDefs().get(0);
    }

    public void testComputeFilterMatches() throws Exception {
        FlavorIncludeDef fi = source("<aura:use source='flavorTestAlt:flavorsAlt'/>");
        Table<DefDescriptor<ComponentDef>, String, DefDescriptor<FlavoredStyleDef>> mapping = fi.computeFlavorMapping();

        DefDescriptor<ComponentDef> sample1 = DefDescriptorImpl.getInstance("flavorTest:sampleCmp1", ComponentDef.class);
        DefDescriptor<ComponentDef> sample2 = DefDescriptorImpl.getInstance("flavorTest:sampleCmp2", ComponentDef.class);
        DefDescriptor<ComponentDef> sample3 = DefDescriptorImpl.getInstance("flavorTest:sampleCmp3", ComponentDef.class);

        DefDescriptor<FlavoredStyleDef> sample1Flavor = Flavors.customFlavorDescriptor(sample1, "flavorTestAlt", "flavorsAlt");
        DefDescriptor<FlavoredStyleDef> sample2Flavor = Flavors.customFlavorDescriptor(sample2, "flavorTestAlt", "flavorsAlt");
        DefDescriptor<FlavoredStyleDef> sample3Flavor = Flavors.customFlavorDescriptor(sample3, "flavorTestAlt", "flavorsAlt");

        assertEquals(3, mapping.row(sample1).size());
        assertEquals(sample1Flavor, mapping.get(sample1, "default"));
        assertEquals(sample1Flavor, mapping.get(sample1, "default2"));
        assertEquals(sample1Flavor, mapping.get(sample1, "default3"));

        assertEquals(1, mapping.row(sample2).size());
        assertEquals(sample2Flavor, mapping.get(sample2, "s1"));

        assertEquals(1, mapping.row(sample3).size());
        assertEquals(sample3Flavor, mapping.get(sample3, "neutral"));
        assertNull(mapping.get(sample3, "default"));
    }

    public void testAppendsDependencies() throws Exception {
        FlavorIncludeDef fi = source("<aura:use source='flavorTestAlt:flavorsAlt'/>");
        Set<DefDescriptor<?>> dependencies = new HashSet<>();
        fi.appendDependencies(dependencies);

        DefDescriptor<ComponentDef> sample1 = DefDescriptorImpl.getInstance("flavorTest:sampleCmp1", ComponentDef.class);
        DefDescriptor<ComponentDef> sample2 = DefDescriptorImpl.getInstance("flavorTest:sampleCmp2", ComponentDef.class);
        DefDescriptor<ComponentDef> sample3 = DefDescriptorImpl.getInstance("flavorTest:sampleCmp3", ComponentDef.class);
        DefDescriptor<FlavoredStyleDef> sample1Flavor = Flavors.customFlavorDescriptor(sample1, "flavorTestAlt", "flavorsAlt");
        DefDescriptor<FlavoredStyleDef> sample2Flavor = Flavors.customFlavorDescriptor(sample2, "flavorTestAlt", "flavorsAlt");
        DefDescriptor<FlavoredStyleDef> sample3Flavor = Flavors.customFlavorDescriptor(sample3, "flavorTestAlt", "flavorsAlt");

        assertEquals(3, dependencies.size());
        assertTrue(dependencies.contains(sample1Flavor));
        assertTrue(dependencies.contains(sample2Flavor));
        assertTrue(dependencies.contains(sample3Flavor));
    }

    public void testErrorsInInvalidSource() throws Exception {
        try {
            source("<aura:use source='foo'/>").validateDefinition();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "The 'source' attribute must take the format");
        }
    }
}